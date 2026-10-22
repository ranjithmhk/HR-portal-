"""STEP 11 - FACT LOAD (CDC): data lake + dimensions -> datawarehouse/fact_* (Delta).

    python -m pipeline.step11_load_facts

Run after step 10 (dimensions first, so facts can find their keys). Per fact, only AFFECTED rows
are rebuilt and MERGEd (by grain). A row is affected when

  1. its base record changed after the checkpoint        (new payment, status update ...)
  2. a record it was joined with changed                  (order moved to another merchant ...)
  3. it points to an Unknown (-1) dimension member AND a dimension of this fact changed since the
     last run                                             (late-arriving dimension: the merchant
                                                           shows up after its first payments)
  4. its base record was deleted                          (fact row is deleted)

Facts whose grain is not the base primary key (daily snapshots: merchant x day) are rebuilt in full
every time something changed - "newest wins" per grain needs all source rows - the MERGE still writes
only rows whose values differ. Nothing changed anywhere -> the fact is skipped untouched.

Dimension keys use the version valid on the as_of date (SCD2 point-in-time), so a new dimension
version never rewrites old facts. Checkpoints move after the write (utils/dw_checkpoint.py).

Returns {"dates": {date keys touched}, "full_gold": bool} for the gold step.
"""
import pandas as pd
from pyspark.sql import functions as F
from config import settings
from config.facts import FACTS
from config.oltp_mapping import TABLE_PKS
from utils import delta_store, dw_checkpoint, lake
from utils.dw_store import read_dim, write_full, write_merge
from utils.fact_keys import date_key, dim_key, time_key
from utils.scd import key_text

MAX_TRACKED = 100_000        # above this many touched rows, gold is rebuilt in full instead of by date


def add_join(df, join):
    """Bring in columns (or a per-key summary) from another lake table."""
    other = lake.read_current(join["table"])
    if other.empty:
        return df
    if "agg" in join:
        other = other.groupby(join["on"]).agg(**join["agg"]).reset_index()
    else:
        other = other[[join["on"]] + join["columns"]].drop_duplicates(join["on"])
    other = other.drop(columns=[c for c in other.columns if c in df.columns and c != join["on"]])
    return df.merge(other, on=join["on"], how="left")


def is_row_level(spec):
    """True when one fact row = one base record, so single rows can be rebuilt on their own."""
    return spec["grain"] == TABLE_PKS.get(spec["base"].upper())


def affected_rows(df, spec, since, unknown_grains):
    """Boolean mask: which joined base rows must be rebuilt (rules 1-3 in the module doc)."""
    mask = df["_change_id"] > since.get(spec["base"], -1)                       # 1. base changed
    for join in spec.get("joins", []):                                          # 2. joined record changed
        if join["on"] in df.columns:
            changed = lake.changed_values(join["table"], since.get(join["table"], -1), join["on"])
            if changed:
                mask |= df[join["on"]].isin(changed)
    if unknown_grains:                                                          # 3. late-arriving dimension
        mask |= key_text(df, spec["grain"]).isin(unknown_grains)
    return mask


def build_fact(spec, dims, since=None, unknown_grains=None):
    """Fact rows for the base rows that are affected (all rows when since is None)."""
    df = lake.read_current(spec["base"])
    if df.empty:
        return df, set()
    for join in spec.get("joins", []):
        df = add_join(df, join)
    current_ids = set(df["_record_id"])
    if since is not None and is_row_level(spec):
        df = df[affected_rows(df, spec, since, unknown_grains)]
    if df.empty:
        return pd.DataFrame(), current_ids

    fact = pd.DataFrame(index=df.index)
    for dim_name, key, on in spec["dims"]:                     # 1. dimension keys
        fact[key] = dim_key(df, dims[dim_name], dims[dim_name].columns[0], on, spec["as_of"])
    for key, col in spec.get("dates", []):                     # 2. date / time keys
        fact[key] = date_key(df[col])
    for key, col in spec.get("times", []):
        fact[key] = time_key(df[col])
    for name, how in spec["measures"].items():                 # 3. measures
        fact[name] = how(df) if callable(how) else df[how]
    for col in spec["degenerate"]:                             # 4. degenerate ids
        fact[col] = df[col]

    fact["_order"] = df[spec["as_of"]]                         # 5. one row per grain (newest wins)
    fact = fact.sort_values("_order", kind="stable").drop_duplicates(spec["grain"], keep="last")
    return fact.drop(columns="_order").reset_index(drop=True), current_ids


def unknown_grains_of(name, spec):
    """Grain values of existing fact rows that point to the Unknown member of any dimension / date."""
    keys = [k for _, k, _ in spec["dims"]] + [k for k, _ in spec.get("dates", [])]
    if not delta_store.exists(settings.DATAWAREHOUSE, name):
        return set()
    existing = delta_store.read(settings.DATAWAREHOUSE, name)
    keys = [k for k in keys if k in existing.columns]
    if not keys:
        return set()
    cond = None
    for k in keys:
        c = F.col(k) == -1
        cond = c if cond is None else cond | c
    return set(key_text(existing.filter(cond).select(*spec["grain"]).toPandas(), spec["grain"]))


def date_keys_of(fact, spec):
    names = [k for k, _ in spec.get("dates", [])]
    return {int(v) for k in names if k in fact for v in fact[k].dropna().unique()}


def old_dates(name, spec, grains):
    """Date keys the rows had BEFORE they were rebuilt (a moved row must refresh its old day in gold too)."""
    if not grains or not delta_store.exists(settings.DATAWAREHOUSE, name):
        return set()
    names = [k for k, _ in spec.get("dates", [])]
    existing = delta_store.read(settings.DATAWAREHOUSE, name)
    names = [k for k in names if k in existing.columns]
    if not names or len(spec["grain"]) != 1:
        return set()
    rows = existing.filter(F.col(spec["grain"][0]).isin(list(grains))).select(*names).distinct().collect()
    return {int(v) for r in rows for v in r if v is not None}


def main(full=False):
    result = {"dates": set(), "full_gold": False}
    needed = {d for spec in FACTS.values() for d, _, _ in spec["dims"]}
    dims = {name: read_dim(name) for name in needed}
    missing = [n for n, d in dims.items() if d.empty]
    if missing:
        raise SystemExit(f"Run step 10 first - missing dimensions: {missing}")
    revisions = dw_checkpoint.get("dim_revision")

    for name, spec in FACTS.items():
        consumer = f"fact:{name}"
        seen = {} if full else dw_checkpoint.get(consumer)
        tables = [spec["base"]] + [j["table"] for j in spec.get("joins", [])]
        highs = {t: lake.high_water(t) for t in tables}
        highs = {t: h for t, h in highs.items() if h is not None}
        if spec["base"] not in highs:
            print(f"  {name:<30} no data in the lake - skipped")
            continue
        dim_names = sorted({d for d, _, _ in spec["dims"]})
        dim_seen = {d: revisions.get(d, 0) for d in dim_names}
        first = full or not delta_store.exists(settings.DATAWAREHOUSE, name)
        lake_changed = any(h > seen.get(t, -1) for t, h in highs.items())
        dim_changed = any(dim_seen[d] > seen.get(f"dim:{d}", 0) for d in dim_names)
        if not first and not lake_changed and not dim_changed:
            print(f"  {name:<30} no new changes - skipped")
            continue

        since = None if first else seen
        unknown = unknown_grains_of(name, spec) if (not first and dim_changed and is_row_level(spec)) else None
        fact, current_ids = build_fact(spec, dims, since, unknown)

        deleted = set()
        if not first and is_row_level(spec):                              # 4. source record deleted
            deleted = lake.deleted_ids(spec["base"], seen.get(spec["base"], -1)) - current_ids

        # which rows will really change -> which dates gold must refresh (old date too: a row can move)
        changed = fact if first else delta_store.changed_rows(settings.DATAWAREHOUSE, name, fact, spec["grain"])
        touched = date_keys_of(changed, spec) if not changed.empty else set()
        if not first and len(spec["grain"]) == 1 and not changed.empty:
            touched |= old_dates(name, spec, set(changed[spec["grain"][0]]))
        if deleted:
            touched |= old_dates(name, spec, deleted)

        if first:
            if not fact.empty:
                write_full(name, fact)
            stats = {"inserted": len(fact), "updated": 0, "deleted": 0}
            result["full_gold"] = True
        else:
            stats = write_merge(name, fact, spec["grain"]) if not fact.empty else {"inserted": 0, "updated": 0, "deleted": 0}
            if deleted:
                stats["deleted"] = delta_store.delete_keys(settings.DATAWAREHOUSE, name, spec["grain"][0], deleted)

        result["dates"] |= touched
        if len(touched) > MAX_TRACKED:
            result["full_gold"] = True
        dw_checkpoint.put(consumer, {**highs, **{f"dim:{d}": v for d, v in dim_seen.items()}})   # AFTER the write

        keys = [k for _, k, _ in spec["dims"]] + [k for k, _ in spec.get("dates", [])]
        unknown_now = {k: int((fact[k] == -1).sum()) for k in keys if k in fact and (fact[k] == -1).any()}
        note = f"  ! unknown keys: {unknown_now}" if unknown_now else ""
        print(f"  {name:<30} {len(fact):>7} rows read | +{stats['inserted']} new  ~{stats['updated']} changed"
              f"  -{stats['deleted']} deleted{note}")
    return result


if __name__ == "__main__":
    main()
