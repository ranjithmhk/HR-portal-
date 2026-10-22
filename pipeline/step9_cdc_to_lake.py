"""STEP 9 - CDC -> LAKE: copy new changes of every OLTP table into the analytical lake.

    Postgres trigger + cdc_audit table  ->  Delta Change Data Feed (built in, no setup step)
    data/lake/cdc/<table>/*.parquet     ->  Delta table  <ROOT>/datalake/<table>

Only versions after the checkpoint are read. The lake rows are written first and ONLY THEN the
checkpoint moves: a crash in between re-reads the same changes next time, and readers
de-duplicate (one row per _record_id, newest _change_id wins) - no data is lost.

Lake columns = the table's columns (PII hashed / dropped) + _op (I/U/D), _change_id (Delta
version), _changed_at (commit time), _record_id (primary key value, 'M1' or 'M1|UPI').
"""
import pandas as pd
from delta.tables import DeltaTable
from pyspark.sql import functions as F
from config import settings
from config.oltp_mapping import TABLE_PKS
from config.pii import mask_pii
from utils import delta_store
from utils.delta_store import spark

CHECKPOINT = "cdc_checkpoint"


def get_checkpoints():
    df = delta_store.read_pandas(settings.OPS, CHECKPOINT)
    return dict(zip(df["table_name"], df["last_version"])) if not df.empty else {}


def save_checkpoint(table, version):
    row = pd.DataFrame({"table_name": [table], "last_version": [int(version)]})
    delta_store.upsert(settings.OPS, CHECKPOINT, row, ["table_name"])


def flatten(changes, pk):
    """Change feed rows -> one flat row per change, PII masked."""
    op = (F.when(F.col("_change_type") == "insert", "I")
           .when(F.col("_change_type") == "update_postimage", "U").otherwise("D"))
    record_id = F.concat_ws("|", *[F.col(c).cast("string") for c in pk])
    changes = (changes.filter(F.col("_change_type") != "update_preimage")
               .withColumn("_op", op)
               .withColumn("_change_id", F.col("_commit_version"))
               .withColumn("_changed_at", F.col("_commit_timestamp"))
               .withColumn("_record_id", record_id)
               .drop("_change_type", "_commit_version", "_commit_timestamp"))
    return mask_pii(changes)


def main():
    delta_store.ensure_storage()
    checkpoints = get_checkpoints()
    total = 0
    for name, pk in TABLE_PKS.items():
        table = name.lower()
        if not delta_store.exists(settings.VALIDATED, table):
            continue
        full = settings.path(settings.VALIDATED, table)
        latest = DeltaTable.forPath(spark, full).history(1).collect()[0]["version"]
        start = max(int(checkpoints.get(table, 0)) + 1, 1)         # version 0 = empty table
        if start > latest:
            continue

        changes = (spark.read.format("delta").option("readChangeFeed", "true")
                   .option("startingVersion", start).option("endingVersion", latest).load(full))
        lake = flatten(changes, pk).cache()
        count = lake.count()
        if count:
            (lake.write.format("delta").mode("append").option("mergeSchema", "true")   # 1. write first
             .save(settings.path(settings.DATALAKE, table)))
        lake.unpersist()
        save_checkpoint(table, latest)                                                  # 2. then move checkpoint
        total += count
        print(f"  {table:<24} {count:>7} changes -> {settings.path(settings.DATALAKE, table)} (v{start}..v{latest})")
    print(f"Done - {total} new changes.")


if __name__ == "__main__":
    main()
