"""STEP 4 - TRANSFORM: split one wide raw table into small 3NF tables (rules in config/oltp_mapping.py)."""
import pandas as pd
from config.oltp_mapping import REST
from utils.oltp_store import latest_per_key


def _pairs(columns):
    """["a", ("b", "c")] -> {"a": "a", "b": "c"}   (raw name -> new name)"""
    return dict((c, c) if isinstance(c, str) else c for c in columns)


def _sources(spec, raw_cols, used):
    if spec.get("columns") == REST:
        rest = [c for c in raw_cols if c not in used and c not in spec.get("skip", [])]
        return [list(dict.fromkeys(rest + spec.get("keep", [])))]
    return spec.get("sources", [spec.get("columns")])


def build_table(raw_df, spec, used):
    parts = []
    for source in _sources(spec, raw_df.columns, used):
        cols = {raw: new for raw, new in _pairs(source).items() if raw in raw_df.columns}
        parts.append(raw_df[list(cols)].rename(columns=cols))
    table = pd.concat(parts, ignore_index=True)

    if "split" in spec:                                   # "UPI|CC" -> 2 rows
        col = spec["split"]
        table[col] = table[col].str.upper().str.split(r"\s*[,|;]\s*")
        table = table.explode(col)

    required = spec.get("required", spec["pk"])
    if not set(required) <= set(table.columns):
        return None                                       # key column not in this file
    table = table.dropna(subset=required)
    return latest_per_key(table, spec["pk"]) if len(table) else None


def to_3nf(raw_df, tables):
    """good raw rows -> {table_name: DataFrame}"""
    used = {raw for spec in tables.values() if spec.get("columns") != REST
            for source in spec.get("sources", [spec.get("columns")]) for raw in _pairs(source)}
    built = {name: build_table(raw_df, spec, used) for name, spec in tables.items()}
    return {name: df for name, df in built.items() if df is not None}
