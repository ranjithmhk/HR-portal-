"""Everything that touches Delta tables: pandas <-> Spark, MERGE (upsert), overwrite, append.

Tables are addressed by LAYER + NAME and live at  <STORAGE_ROOT>/<layer>/<name>  (see
config/settings.py):  validated/merchant, datalake/merchant, datawarehouse/dim_merchant ...

One place, so the pipeline steps stay plain pandas like in payu_etl/.
Data is moved through the driver (toPandas / createDataFrame): fine for the PayU training
volumes (up to a few million rows); see README "Scaling" for what to change beyond that.
"""
import pandas as pd
from delta.tables import DeltaTable
from pyspark.sql import SparkSession, functions as F, types as T
from config import settings

spark = SparkSession.builder.getOrCreate()


def ensure_storage():
    """Session settings + the storage root (a Unity Catalog volume is created if it does not exist)."""
    try:                                       # some compute types (serverless) restrict session configs
        spark.conf.set("spark.sql.session.timeZone", "UTC")
    except Exception as error:
        print(f"  (session time zone not changed: {error.__class__.__name__})")
    parts = settings.ROOT.strip("/").split("/")
    if parts[0] == "Volumes" and len(parts) >= 4:                          # /Volumes/<catalog>/<schema>/<volume>/...
        catalog, schema, volume = parts[1:4]
        spark.sql(f"CREATE SCHEMA IF NOT EXISTS `{catalog}`.`{schema}`")
        spark.sql(f"CREATE VOLUME IF NOT EXISTS `{catalog}`.`{schema}`.`{volume}`")


def exists(layer, table):
    return DeltaTable.isDeltaTable(spark, settings.path(layer, table))


def sql_ref(layer, table):
    """How to name a table inside a SQL text:  delta.`/Volumes/.../datawarehouse/dim_merchant`"""
    return f"delta.`{settings.path(layer, table)}`"


def read(layer, table):
    """Spark DataFrame of a table."""
    return spark.read.format("delta").load(settings.path(layer, table))


# ----------------------------------------------------------------- pandas -> Spark
def _spark_type(s):
    if pd.api.types.is_bool_dtype(s):
        return T.BooleanType()
    if pd.api.types.is_integer_dtype(s):
        return T.LongType()
    if pd.api.types.is_float_dtype(s):
        return T.DoubleType()
    if pd.api.types.is_datetime64_any_dtype(s):
        return T.TimestampType()
    first = s.dropna()
    if first.empty:
        return T.StringType()                       # all-empty text column
    v = first.iloc[0]
    if isinstance(v, bool):
        return T.BooleanType()
    if isinstance(v, int):
        return T.LongType()
    if isinstance(v, float):
        return T.DoubleType()
    if isinstance(v, pd.Timestamp):
        return T.TimestampType()
    return T.StringType()


def _utc(value):
    """Always a timezone-aware UTC datetime, so Spark never reads it in the driver's local zone."""
    t = pd.Timestamp(value)
    return (t.tz_localize("UTC") if t.tzinfo is None else t.tz_convert("UTC")).to_pydatetime()


_CONVERT = {T.BooleanType: bool, T.LongType: int, T.DoubleType: float, T.StringType: str,
            T.TimestampType: _utc}


def to_spark(pdf):
    """pandas -> Spark with an explicit schema. NaN / NaT / <NA> become real NULLs,
    extension dtypes (string, boolean, Int64) are handled; naive timestamps are taken as UTC."""
    fields, columns = [], []
    for name in pdf.columns:
        s = pdf[name]
        spark_type = _spark_type(s)
        convert = _CONVERT[type(spark_type)]
        columns.append([None if pd.isna(v) else convert(v) for v in s])
        fields.append(T.StructField(str(name), spark_type, True))
    return spark.createDataFrame(list(zip(*columns)), T.StructType(fields))


# ----------------------------------------------------------------- read / write
def read_pandas(layer, table):
    return read(layer, table).toPandas() if exists(layer, table) else pd.DataFrame()


def write_table(pdf, layer, table, mode="overwrite"):
    """overwrite = replace table (dimensions, facts)   append = add rows (quarantine)"""
    writer = to_spark(pdf).write.format("delta").mode(mode)
    writer = writer.option("overwriteSchema", "true") if mode == "overwrite" else writer.option("mergeSchema", "true")
    writer.save(settings.path(layer, table))


def read_column(layer, table, column):
    """Just one column's distinct values (used by the foreign-key and checkpoint checks)."""
    if not exists(layer, table) or column not in read(layer, table).columns:
        return set()
    return {r[0] for r in read(layer, table).select(column).distinct().collect()}


def version(layer, table):
    """Current Delta version of a table (-1 = table does not exist)."""
    if not exists(layer, table):
        return -1
    return DeltaTable.forPath(spark, settings.path(layer, table)).history(1).collect()[0]["version"]


def _metrics(path, before):
    """What the last MERGE did. If it committed nothing (version unchanged) all zeros."""
    last = DeltaTable.forPath(spark, path).history(1).collect()[0]
    m = (last["operationMetrics"] or {}) if last["version"] != before else {}
    return {"inserted": int(m.get("numTargetRowsInserted", 0)),
            "updated": int(m.get("numTargetRowsUpdated", 0)),
            "deleted": int(m.get("numTargetRowsDeleted", m.get("numDeletedRows", 0)))}


def _align(path, source, cdf):
    """Make the table ready for a MERGE of `source`: create it if missing (optionally with Change
    Data Feed), add columns the data brought, cast source columns to the table's types."""
    if not DeltaTable.isDeltaTable(spark, path):
        source.limit(0).write.format("delta").save(path)
        if cdf:
            spark.sql(f"ALTER TABLE delta.`{path}` SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")
    target = DeltaTable.forPath(spark, path)
    fields = {f.name: f.dataType for f in target.toDF().schema.fields}
    new_cols = [f for f in source.schema.fields if f.name not in fields]
    if new_cols:
        ddl = ", ".join(f"`{f.name}` {f.dataType.simpleString()}" for f in new_cols)
        spark.sql(f"ALTER TABLE delta.`{path}` ADD COLUMNS ({ddl})")
        target = DeltaTable.forPath(spark, path)
        fields.update({f.name: f.dataType for f in new_cols})
    for col, data_type in fields.items():
        if col in source.columns:
            source = source.withColumn(col, F.col(col).cast(data_type))
    return target, source


def upsert(layer, table, pdf, pk):
    """MERGE by primary key (OLTP / validated tables). Safe to re-run:
       * new key      -> INSERT
       * known key    -> UPDATE, but an empty new value never wipes an old one (COALESCE)
       * nothing new  -> row untouched (so Change Data Feed only logs REAL changes)
       The table is created with Change Data Feed on: that is our CDC (replaces step 8).
       Returns {"inserted", "updated", "deleted"} - the row-level CDC result of this load."""
    path = settings.path(layer, table)
    target, source = _align(path, to_spark(pdf), cdf=True)
    before = version(layer, table)

    rest = [c for c in source.columns if c not in pk]
    merge = target.alias("t").merge(
        source.alias("s"), " AND ".join(f"t.`{k}` = s.`{k}`" for k in pk))
    if rest:
        changed = " OR ".join(f"NOT (coalesce(s.`{c}`, t.`{c}`) <=> t.`{c}`)" for c in rest)
        merge = merge.whenMatchedUpdate(
            condition=changed, set={c: f"coalesce(s.`{c}`, t.`{c}`)" for c in rest})
    # explicit columns: today's data may have fewer columns than the table (e.g. MERCHANT comes
    # from 3 raw files with different columns) - the rest stays NULL
    merge.whenNotMatchedInsert(values={c: f"s.`{c}`" for c in source.columns}).execute()
    return _metrics(path, before)


def merge_rows(layer, table, pdf, keys):
    """Warehouse MERGE (dimensions, facts): the incoming row is the truth - values are replaced as they
    are (NULL included). Only rows that really differ are written; every written row gets _updated_at.
    Returns {"inserted", "updated", "deleted"}."""
    path = settings.path(layer, table)
    source = to_spark(pdf).withColumn("_updated_at", F.current_timestamp())
    target, source = _align(path, source, cdf=False)
    before = version(layer, table)

    rest = [c for c in source.columns if c not in keys and c != "_updated_at"]
    merge = target.alias("t").merge(
        source.alias("s"), " AND ".join(f"t.`{k}` = s.`{k}`" for k in keys))
    if rest:
        changed = " OR ".join(f"NOT (s.`{c}` <=> t.`{c}`)" for c in rest)
        merge = merge.whenMatchedUpdate(
            condition=changed, set={c: f"s.`{c}`" for c in rest + ["_updated_at"]})
    merge.whenNotMatchedInsert(values={c: f"s.`{c}`" for c in source.columns}).execute()
    return _metrics(path, before)


def delete_keys(layer, table, column, values):
    """DELETE rows whose `column` is in `values` (a fact whose source record was deleted)."""
    values = list(values)
    if not values or not exists(layer, table):
        return 0
    path = settings.path(layer, table)
    before = version(layer, table)
    for i in range(0, len(values), 5000):
        DeltaTable.forPath(spark, path).delete(F.col(column).isin(values[i:i + 5000]))
    return _metrics(path, before)["deleted"]


def changed_rows(layer, table, pdf, keys):
    """The rows of `pdf` that are new or differ from what the table holds (what a merge_rows would write).
    Used to know exactly which dates a fact load touched."""
    if pdf.empty or not exists(layer, table):
        return pdf
    source, target = to_spark(pdf), read(layer, table)
    cols = [c for c in source.columns if c not in keys]
    if any(c not in target.columns for c in source.columns):      # new column: everything counts as changed
        return pdf
    for c in source.columns:
        source = source.withColumn(c, F.col(c).cast(target.schema[c].dataType))
    same = None
    for c in source.columns:
        cond = source[c] == target[c] if c in keys else source[c].eqNullSafe(target[c])
        same = cond if same is None else same & cond
    return source.join(target, same, "left_anti").toPandas()
