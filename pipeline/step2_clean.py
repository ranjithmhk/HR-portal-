"""STEP 2 - CLEAN: trim text, standardise codes, give every column its real type.
A value that cannot be converted is not dropped silently: the reason is written
into the _errors column and step 3 sends that row to quarantine."""
import pandas as pd
from config import settings as s

TRUE, FALSE = {"true", "t", "yes", "y", "1"}, {"false", "f", "no", "n", "0"}


def add_error(df, mask, message):
    df.loc[mask, "_errors"] += message + "; "


def to_bool(text):
    return text.str.lower().map(lambda v: True if v in TRUE else False if v in FALSE else None).astype("boolean")


def clean(df):
    df = df.dropna(how="all").copy()
    df.columns = df.columns.str.strip().str.lower()
    df["_errors"] = ""
    for col in df.columns.drop("_errors"):
        text = df[col].astype("string").str.strip()
        text = text.mask(text == "")                       # "" -> empty
        name = col.split(".")[0]                           # 'success_rate_percent.1' -> rule of base name
        if name.endswith(s.NUMBER_ENDINGS):
            new = pd.to_numeric(text.str.replace(",", "", regex=False), errors="coerce")
        elif name.endswith(s.DATE_ENDINGS):
            new = pd.to_datetime(text, errors="coerce", utc=True, format="mixed")
        elif name.startswith(s.BOOL_PREFIX):
            new = to_bool(text)
        else:                                              # plain text
            df[col] = text.str.upper() if name.endswith(s.UPPER_ENDINGS) else text
            continue
        add_error(df, text.notna() & new.isna(), f"bad value in {col}")
        df[col] = new
    return df
