"""Read the analytical lake written by step 9 (Delta tables in <ROOT>/datalake/)."""
import pandas as pd
from pyspark.sql import Window, functions as F
from config import settings
from utils import delta_store


def read_current(table):
    """Latest version of every record. Records whose last change is a DELETE are left out."""
    if not delta_store.exists(settings.DATALAKE, table):
        return pd.DataFrame()
    newest = Window.partitionBy("_record_id").orderBy(F.col("_change_id").desc(), F.col("_changed_at").desc())
    sdf = (delta_store.read(settings.DATALAKE, table)
           .withColumn("_rn", F.row_number().over(newest))
           .filter((F.col("_rn") == 1) & (F.col("_op") != "D")).drop("_rn"))
    return sdf.toPandas().reset_index(drop=True)


def high_water(table):
    """Newest _change_id in a lake table (None = table missing or empty)."""
    if not delta_store.exists(settings.DATALAKE, table):
        return None
    row = delta_store.read(settings.DATALAKE, table).agg(F.max("_change_id")).first()
    return None if row[0] is None else int(row[0])


def read_changes(table, since):
    """Every change after `since` (all versions of a record, oldest first), deletes left out.
    This is what SCD2 dimensions read, so no intermediate version is lost between two runs."""
    if not delta_store.exists(settings.DATALAKE, table):
        return pd.DataFrame()
    sdf = (delta_store.read(settings.DATALAKE, table)
           .filter((F.col("_change_id") > since) & (F.col("_op") != "D"))
           .orderBy("_change_id", "_changed_at"))
    return sdf.toPandas().reset_index(drop=True)


def changed_values(table, since, column):
    """Distinct values of `column` in changes after `since` (which keys did this table touch?)."""
    if not delta_store.exists(settings.DATALAKE, table):
        return set()
    sdf = delta_store.read(settings.DATALAKE, table)
    if column not in sdf.columns:
        return set()
    rows = sdf.filter(F.col("_change_id") > since).select(column).distinct().collect()
    return {r[0] for r in rows if r[0] is not None}


def deleted_ids(table, since):
    """_record_id of records whose change after `since` is a DELETE."""
    if not delta_store.exists(settings.DATALAKE, table):
        return set()
    rows = (delta_store.read(settings.DATALAKE, table)
            .filter((F.col("_change_id") > since) & (F.col("_op") == "D"))
            .select("_record_id").distinct().collect())
    return {r[0] for r in rows}
