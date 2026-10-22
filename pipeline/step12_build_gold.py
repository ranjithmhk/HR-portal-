"""STEP 12 - GOLD (layer 10): pre-aggregated business tables for dashboards. Spark SQL.

    python -m pipeline.step12_build_gold

Incremental by date: every gold table has date_key in its key, so only the dates whose facts
changed are recomputed (the query is filtered to those dates) and swapped in with Delta's
replaceWhere - one atomic commit, a dashboard never sees a half-built table, and a day that lost
all its rows is emptied correctly.

A FULL rebuild happens when: the table does not exist yet / full refresh was asked / the fact load
says so (first load, very many dates) / a Type 1 dimension attribute was overwritten (old gold rows
carry the old name, e.g. a bank renamed). No fact changed -> nothing to do.
"""
from config import settings
from config.gold import GOLD
from utils import delta_store
from utils.delta_store import spark

MAX_DATES = 2000          # a longer IN-list is not worth it: rebuild everything


def build(name, spec, dates):
    """dates = None -> rebuild the whole table, else only these date keys."""
    path = settings.path(settings.DATAWAREHOUSE, name)
    full = dates is None or not delta_store.exists(settings.DATAWAREHOUSE, name) or len(dates) > MAX_DATES
    sql = spec["sql"] if full else f"SELECT * FROM ({spec['sql']}) WHERE date_key IN ({', '.join(map(str, sorted(dates)))})"
    result = spark.sql(sql).cache()
    writer = result.write.format("delta").mode("overwrite").option("overwriteSchema", "true") if full \
        else result.write.format("delta").mode("overwrite").option(
            "replaceWhere", f"date_key IN ({', '.join(map(str, sorted(dates)))})")
    writer.save(path)
    rows = result.count()
    result.unpersist()

    total = delta_store.read(settings.DATAWAREHOUSE, name)
    dup = total.count() - total.select(*spec["pk"]).distinct().count()
    if dup:                                             # Delta has no enforced PK: check it ourselves
        print(f"  ! {name}: {dup} duplicate values of {spec['pk']}")
    return rows, full


def main(full=False, dates=None, full_gold=False):
    """full / full_gold -> rebuild all.  dates (set of date keys) -> only those.  Neither -> nothing changed."""
    delta_store.ensure_storage()
    if not (full or full_gold or dates):
        print("  facts unchanged - gold is up to date")
        return
    target = None if (full or full_gold) else dates
    for name, spec in GOLD.items():
        rows, was_full = build(name, spec, target)
        scope = "full rebuild" if was_full else f"{len(dates)} date(s) refreshed"
        print(f"  {name:<34} {rows:>7} rows | {scope}")


if __name__ == "__main__":
    main(full=True)
