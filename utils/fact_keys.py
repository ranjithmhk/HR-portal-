"""Turn business values in a fact into warehouse keys.
A value that has no matching dimension row gets -1 (the Unknown member)."""
import pandas as pd
from utils.scd import key_text, to_day


def dim_key(fact, dim, sk, on, as_of=None):
    """on = {fact column: dimension column}. SCD2 dimensions (with start_date) use a
    point-in-time lookup: the version that was valid on the as_of date."""
    left = pd.DataFrame({"_k": key_text(fact, list(on)), "_row": range(len(fact))})
    right = dim[dim[sk] != -1].copy()
    right["_k"] = key_text(right, list(on.values()))
    cols = ["_k", sk] + (["start_date", "end_date"] if "start_date" in dim else [])
    match = left.merge(right[cols], on="_k")

    if "start_date" in dim:            # SCD2: start_date <= day <= end_date (empty end = still valid)
        day = to_day(fact[as_of]).to_numpy()[match["_row"]]
        valid = (match["start_date"] <= day) & (match["end_date"].isna() | (day <= match["end_date"]))
        match = match[valid]

    keys = match.drop_duplicates("_row").set_index("_row")[sk]
    return pd.Series(range(len(fact)), index=fact.index).map(keys).fillna(-1).astype(int)


def date_key(values):
    """2025-12-22 10:15 -> 20251222   (missing -> -1)"""
    day = to_day(values)
    return day.dt.strftime("%Y%m%d").astype("float").fillna(-1).astype(int)


def time_key(values):
    """2025-12-22 10:15 -> 1015"""
    t = pd.to_datetime(values, errors="coerce", utc=True)
    return (t.dt.hour * 100 + t.dt.minute).fillna(-1).astype(int)