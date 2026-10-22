"""STEP 6 - LOAD: MERGE the day's 3NF rows into validated/<table> (Delta), rejected rows into validated/quarantine.

Delta tables replace Postgres (and the S3 parquet uploads). Change Data Feed is switched on when a
table is created, so every later INSERT / UPDATE is recorded for step 9 (the CDC)."""
import pandas as pd
from config import settings
from config.oltp_mapping import FOREIGN_KEYS
from utils import delta_store

QUARANTINE = "quarantine"
AUDIT = "load_audit"


def load_order(tables):
    """Parents before children (MERCHANT before PAYMENT_ORDER ...)."""
    order = []

    def visit(table):
        if table in order:
            return
        for child, _, parent in FOREIGN_KEYS:
            if child == table and parent in tables:
                visit(parent)
        order.append(table)

    for table in tables:
        visit(table)
    return order


def save_quarantine(day, rejected):
    """One row per rejected record: day, source table, reason, the record itself as JSON."""
    parts = []
    for name, df in rejected.items():
        if df.empty:
            continue
        rows = df.drop(columns="reject_reason").to_json(orient="records", date_format="iso", lines=True)
        parts.append(pd.DataFrame({"day": day, "source_table": name,
                                   "reject_reason": df["reject_reason"].to_numpy(),
                                   "row_json": rows.splitlines()}))
        print(f"  Rejected {name}: {len(df)} rows -> quarantine")
    if not parts:
        return
    if delta_store.exists(settings.VALIDATED, QUARANTINE):      # re-running a day replaces its rows
        delta_store.spark.sql(f"DELETE FROM {delta_store.sql_ref(settings.VALIDATED, QUARANTINE)} "
                              f"WHERE day = '{day}'")
    out = pd.concat(parts, ignore_index=True).assign(loaded_at=pd.Timestamp.now(tz="UTC"))
    delta_store.write_table(out, settings.VALIDATED, QUARANTINE, mode="append")


def save_audit(day, rows):
    """Row-level CDC result of this load, one row per table (history is kept: reloads add rows)."""
    if rows:
        out = pd.DataFrame(rows).assign(day=day, loaded_at=pd.Timestamp.now(tz="UTC"))
        delta_store.write_table(out, settings.OPS, AUDIT, mode="append")


def load(day, tables, rejected, table_pks):
    """MERGE every table (parents first) and report what changed: inserted / updated / unchanged."""
    day = day.rstrip("/")
    audit = []
    for name in load_order(tables):
        df = tables[name]
        if df.empty:
            continue
        result = delta_store.upsert(settings.VALIDATED, name.lower(), df, table_pks[name])
        unchanged = len(df) - result["inserted"] - result["updated"]
        rej = len(rejected[name]) if name in rejected else 0
        audit.append({"table_name": name.lower(), "rows_in": len(df), "inserted": result["inserted"],
                      "updated": result["updated"], "unchanged": unchanged, "rejected": rej})
        print(f"  {name:<24} {len(df):>6} rows | +{result['inserted']} new  ~{result['updated']} changed  ={unchanged} same")
    save_audit(day, audit)
    save_quarantine(day, rejected)
