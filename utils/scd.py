"""Slowly Changing Dimensions with pandas.

Every dimension has:  surrogate key (sk)  +  business key (bk)  +  descriptive columns.
SCD2 dimensions also have: row_hash, start_date, end_date (empty = still valid), is_current.
Row -1 is the Unknown member: facts point to it when their dimension row is missing.
"""
import hashlib
import numpy as np
import pandas as pd

MIN_DATE = pd.Timestamp("1900-01-01")     # first version of a key is valid "from the beginning"
ONE_DAY = pd.Timedelta(days=1)


def key_text(df, bk):
    """Business key as one text value ('M1' or 'True|False|...') so keys always compare the same."""
    return df[bk].astype("string").fillna("").agg("|".join, axis=1)


def row_hash(df, cols):
    """MD5 of the tracked columns -> a different hash means something changed."""
    text = df[cols].astype("string").fillna("").agg("|".join, axis=1)
    return text.map(lambda s: hashlib.md5(s.encode()).hexdigest())


def to_day(dates):
    return pd.to_datetime(dates, errors="coerce", utc=True).dt.tz_localize(None).dt.normalize()


def lookup(keys, values):
    """keys.map(values), but also works when values is empty (first run)."""
    if values.empty:
        return pd.Series(index=keys.index, dtype=values.dtype)
    return keys.map(values)


def _existing(dim, bk, sk):
    """Dimension rows without the Unknown row, plus the _bk helper column."""
    if dim.empty:
        return pd.DataFrame(columns=[sk, *bk, "_bk"])
    old = dim[dim[sk] != -1].copy()
    old["_bk"] = key_text(old, bk)
    return old


def _new_keys(old, sk, count):
    start = int(old[sk].max()) + 1 if len(old) else 1
    return np.arange(start, start + count)


def _finish(dim, sk):
    dim = dim.drop(columns="_bk").reset_index(drop=True)
    if -1 not in set(dim[sk]):
        unknown = {sk: -1, "is_current": True, "start_date": MIN_DATE} if "is_current" in dim else {sk: -1}
        dim = pd.concat([pd.DataFrame([unknown]), dim], ignore_index=True)
    dim[sk] = dim[sk].astype(int)
    return dim[[sk] + [c for c in dim.columns if c != sk]].sort_values(sk, ignore_index=True)


def scd1(dim, incoming, bk, sk):
    """Type 1 = overwrite. A known key keeps its surrogate key and gets the new values."""
    inc = incoming.copy()
    inc["_bk"] = key_text(inc, bk)
    inc = inc.drop_duplicates("_bk", keep="last")
    old = _existing(dim, bk, sk)

    inc[sk] = lookup(inc["_bk"], old.set_index("_bk")[sk])        # known key -> same surrogate key
    new = inc[sk].isna()
    inc.loc[new, sk] = _new_keys(old, sk, new.sum())           # new key -> next number

    kept = old[~old["_bk"].isin(inc["_bk"])]                   # keys not in today's data stay
    return _finish(pd.concat([kept, inc], ignore_index=True), sk)


def scd2(dim, incoming, bk, sk, tracked, date_col):
    """Type 2 = keep history. A change in a tracked column closes the old row and adds a new one."""
    inc = incoming.copy()
    inc["_bk"] = key_text(inc, bk)
    inc["row_hash"] = row_hash(inc, tracked)
    inc["start_date"] = to_day(inc[date_col]).fillna(MIN_DATE)
    inc = inc.drop(columns=date_col).sort_values(["_bk", "start_date"], kind="stable")
    inc = inc.drop_duplicates(["_bk", "start_date"], keep="last")
    latest = inc.groupby("_bk").last()                          # newest values (for Type 1 columns)

    old = _existing(dim, bk, sk)
    if "is_current" not in old:                                 # first run: empty dimension
        old = old.assign(row_hash="", start_date=MIN_DATE, end_date=pd.NaT, is_current=False)
    current = old[old["is_current"] == True].set_index("_bk")   # noqa: E712 (column can hold None)

    # 1. skip history we already loaded in an earlier run
    already = lookup(inc["_bk"], current["start_date"]).fillna(MIN_DATE - ONE_DAY)
    inc = inc[inc["start_date"] > already]

    # 2. keep only real changes: the hash differs from the version before it
    before = inc.groupby("_bk")["row_hash"].shift().fillna(lookup(inc["_bk"], current["row_hash"]))
    inc = inc[inc["row_hash"] != before].copy()

    # 3. the first version of a brand-new key is valid from the beginning
    first_of_new = ~inc["_bk"].isin(current.index) & ~inc["_bk"].duplicated()
    inc.loc[first_of_new, "start_date"] = MIN_DATE

    # 4. each version ends the day before the next one starts; the last one is current
    next_start = inc.groupby("_bk")["start_date"].shift(-1)
    inc["end_date"] = next_start - ONE_DAY
    inc["is_current"] = next_start.isna()

    # 5. close the old current row of every key that got a new version
    first_change = inc.groupby("_bk")["start_date"].min()
    close = (old["is_current"] == True) & old["_bk"].isin(first_change.index)  # noqa: E712
    old.loc[close, "end_date"] = lookup(old.loc[close, "_bk"], first_change) - ONE_DAY
    old.loc[close, "is_current"] = False

    # 6. new surrogate keys for the new versions
    inc[sk] = _new_keys(old, sk, len(inc))
    dim = pd.concat([old, inc], ignore_index=True)

    # 7. columns that are NOT tracked are Type 1: every version shows the latest value
    for col in latest.columns.difference(bk + tracked + ["row_hash", "start_date"]):
        dim[col] = dim["_bk"].map(latest[col]).fillna(dim[col])
    return _finish(dim, sk)
