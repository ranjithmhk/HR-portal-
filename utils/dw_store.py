"""The data warehouse = <ROOT>/datawarehouse/ (dim_*, fact_*, gold_*), all Delta."""
from config import settings
from utils import delta_store


def read_dim(name):
    return delta_store.read_pandas(settings.DATAWAREHOUSE, name)


def write_merge(name, df, keys):
    """MERGE rows by key; only real changes are written. -> {"inserted", "updated", "deleted"}"""
    return delta_store.merge_rows(settings.DATAWAREHOUSE, name, df, keys)


def write_full(name, df):
    """Replace the whole table (full refresh of a fact)."""
    delta_store.write_table(df, settings.DATAWAREHOUSE, name, mode="overwrite")
