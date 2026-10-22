"""STEP 10 - DIMENSION LOAD (CDC): data lake -> datawarehouse/dim_* (Delta).

    python -m pipeline.step10_load_dimensions

Incremental by change data:
  * A dimension is touched only if one of its source lake tables has changes after the checkpoint
    (utils/dw_checkpoint.py); otherwise it is skipped without reading anything.
  * SCD2 dimensions whose "valid from" is the change time (customer, gateway) read the CHANGE LOG,
    not just the latest state: two changes between two runs give two versions, none is lost.
    Dimensions with their own valid-from column (merchant: effective_from) read the current state.
  * unchanged rows keep their surrogate keys; only real changes insert / update rows (MERGE).
  * every dimension that really changed gets its revision +1. Facts compare revisions to know
    when to look again at rows that point to the Unknown member (late-arriving dimension).
  * the checkpoint moves after the write; a crash repeats the same changes, the MERGE absorbs it.

Returns {"changed": [dims that changed], "scd1_updated": [Type 1 dims with overwritten rows]};
the gold step uses it (an overwritten Type 1 attribute changes old gold rows too).
"""
import pandas as pd
from config import settings
from config.dimensions import DATE_RANGE, DIMENSIONS
from utils import dw_checkpoint, lake
from utils.dw_store import read_dim, write_merge
from utils.scd import scd1, scd2


def sources_of(spec):
    return [t for t, _ in spec["values_from"]] if "values_from" in spec else list(spec["source"])


def uses_change_log(spec):
    """SCD2 + one source + "valid from" = time of the change  ->  every change is a version."""
    return spec["scd"] == 2 and len(spec["source"]) == 1 and spec.get("date", "_changed_at") == "_changed_at"


def build_incoming(spec, since):
    """Rows for one dimension. `since` = {lake table: last _change_id already loaded}."""
    if "values_from" in spec:                                   # small lookup dimension
        parts = []
        for table, cols in spec["values_from"]:
            df = lake.read_current(table)
            if not df.empty and set(cols) <= set(df.columns):
                parts.append(df[list(cols)].rename(columns=cols))
        if not parts:
            return pd.DataFrame()
        return pd.concat(parts, ignore_index=True).dropna(how="all").drop_duplicates()

    main_table = spec["source"][0]
    if uses_change_log(spec):
        df = lake.read_changes(main_table, since.get(main_table, -1))
    else:
        df = lake.read_current(main_table)                      # entity dimension, current state
        for table in spec["source"][1:]:
            df = df.merge(lake.read_current(table), on=spec["key"], how="left", suffixes=("", "_2"))
    if df.empty:
        return df
    extra = [spec.get("date", "_changed_at")] if spec["scd"] == 2 else []
    wanted = list(dict.fromkeys(spec["key"] + spec["columns"] + extra))
    return df[[c for c in wanted if c in df.columns]]


def build_dim_date():
    """Type 0: one row per calendar day. date_key = 20251222."""
    d = pd.DataFrame({"date": pd.date_range(*DATE_RANGE)})
    d.insert(0, "date_key", d["date"].dt.strftime("%Y%m%d").astype(int))
    d["year"], d["quarter"], d["month"] = d["date"].dt.year, d["date"].dt.quarter, d["date"].dt.month
    d["month_name"], d["day"] = d["date"].dt.month_name(), d["date"].dt.day
    d["day_name"], d["week_of_year"] = d["date"].dt.day_name(), d["date"].dt.isocalendar().week.astype(int)
    d["is_weekend"] = d["date"].dt.dayofweek >= 5
    return d


def build_dim_time():
    """Type 0: one row per minute of the day. time_key = 1435 for 14:35."""
    t = pd.DataFrame({"minute_of_day": range(24 * 60)})
    t["hour"], t["minute"] = t["minute_of_day"] // 60, t["minute_of_day"] % 60
    t.insert(0, "time_key", t["hour"] * 100 + t["minute"])
    t["part_of_day"] = pd.cut(t["hour"], [-1, 5, 11, 16, 20, 23],
                              labels=["Night", "Morning", "Afternoon", "Evening", "Night "]).astype(str).str.strip()
    return t.drop(columns="minute_of_day")


def main(full=False):
    """full=True ignores the checkpoints and rebuilds every dimension from the whole change history."""
    result = {"changed": [], "scd1_updated": []}
    write_merge("dim_date", build_dim_date(), ["date_key"])
    write_merge("dim_time", build_dim_time(), ["time_key"])
    print("  dim_date / dim_time          generated")

    revisions = dw_checkpoint.get("dim_revision")
    for name, spec in DIMENSIONS.items():
        consumer = f"dim:{name}"
        sources = sources_of(spec)
        seen = {} if full else dw_checkpoint.get(consumer)
        highs = {t: lake.high_water(t) for t in sources}
        highs = {t: h for t, h in highs.items() if h is not None}
        if not highs:
            print(f"  {name:<28} no data in the lake - skipped")
            continue
        if not full and all(h <= seen.get(t, -1) for t, h in highs.items()):
            print(f"  {name:<28} no new changes - skipped")
            continue

        incoming = build_incoming(spec, seen)
        if incoming.empty:
            dw_checkpoint.put(consumer, highs)
            print(f"  {name:<28} no data in the lake - skipped")
            continue
        old = read_dim(name)
        if spec["scd"] == 2:
            dim = scd2(old, incoming, spec["key"], spec["sk"], spec["tracked"], spec.get("date", "_changed_at"))
        else:
            dim = scd1(old, incoming, spec["key"], spec["sk"])
        merged = write_merge(name, dim, [spec["sk"]])

        if merged["inserted"] or merged["updated"]:
            result["changed"].append(name)
            revisions[name] = revisions.get(name, 0) + 1
            dw_checkpoint.put("dim_revision", {name: revisions[name]})
            if spec["scd"] == 1 and merged["updated"]:
                result["scd1_updated"].append(name)
        dw_checkpoint.put(consumer, highs)                       # AFTER the write
        print(f"  {name:<28} {len(dim):>6} rows (SCD{spec['scd']}) | +{merged['inserted']} new  ~{merged['updated']} changed")
    return result


if __name__ == "__main__":
    main()
