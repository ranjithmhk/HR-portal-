"""Pandas helper shared by step 4 and main. (Reading / writing OLTP tables is in delta_store.py.)"""


def latest_per_key(df, pk):
    """One row per key. Each column keeps its LAST non-empty value,
    so newer data wins but an empty cell never wipes out a value we already had."""
    return df.groupby(pk, as_index=False, sort=False).last()
