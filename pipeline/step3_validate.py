"""STEP 3 - VALIDATE: schema, required values, business rules, duplicates.
Returns (good_rows, rejected_rows). Rejected rows carry a reject_reason."""
from pipeline.step2_clean import add_error


def validate(df, rules):
    df = df.copy()

    # 1. schema: required columns must exist in the file
    missing = [c for c in rules["required"] if c not in df.columns]
    if missing:
        raise ValueError(f"file is missing required columns: {missing}")

    # 2. required values must not be empty
    for col in rules["required"]:
        add_error(df, df[col].isna(), f"{col} is empty")

    # 3. business rules from config/raw_rules.py
    for reason, passes in rules["rules"].items():
        add_error(df, ~passes(df), reason)

    # 4. duplicates: same PK twice -> keep the newest valid copy (webhook / Kafka retries)
    if rules["latest_by"] in df:
        df = df.sort_values(rules["latest_by"], na_position="first", kind="stable")
    valid = df["_errors"] == ""
    dup = df[valid].duplicated(rules["pk"], keep="last").reindex(df.index, fill_value=False)
    add_error(df, dup, f"duplicate {rules['pk']} (newer copy kept)")

    bad = df["_errors"] != ""
    good = df[~bad].drop(columns="_errors")
    rejected = df[bad].rename(columns={"_errors": "reject_reason"})
    rejected["reject_reason"] = rejected["reject_reason"].str.rstrip("; ")
    return good, rejected
