"""Reusable rule builders.
Each builder returns a function:  df -> True/False per row  (True = row PASSES).
Empty values always pass here; "required" columns handle missing values.
"""
import pandas as pd


def _col(df, name):
    """Column if it exists, otherwise an all-empty column (so a missing column never crashes)."""
    return df[name] if name in df else pd.Series(float("nan"), index=df.index)


def _check(condition, *cols):
    empty = pd.concat([c.isna() for c in cols], axis=1).any(axis=1)
    return (empty | condition.fillna(True)).astype(bool)


def positive(col):
    return lambda df: _check(_col(df, col) > 0, _col(df, col))


def at_least(col, minimum):
    return lambda df: _check(_col(df, col) >= minimum, _col(df, col))


def between(col, low, high):
    return lambda df: _check(_col(df, col).between(low, high), _col(df, col))


def one_of(col, allowed):
    return lambda df: _check(_col(df, col).isin(allowed), _col(df, col))


def matches(col, pattern):
    return lambda df: _check(_col(df, col).astype("string").str.fullmatch(pattern), _col(df, col))


def not_more_than(col, other):
    """col <= other  (e.g. refund_amount <= gross_amount)"""
    return lambda df: _check(_col(df, col) <= _col(df, other), _col(df, col), _col(df, other))
