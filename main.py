"""PayU ETL on Databricks:  raw CSVs -> 3NF Delta (OLTP) -> CDC lake -> star schema -> gold.

Normally started from notebooks/run_payu_etl.py. From any Databricks Python context:

    import main
    main.run_all("2025/12/22")        # one day through every layer
    main.run_all("2025/12")           # every day of a month
    main.run_oltp("2025")             # only layer 1 (raw -> OLTP), whole year
    main.run_warehouse()              # only CDC + dimensions + facts + gold
"""
import os
from collections import defaultdict

import pandas as pd

from config.oltp_mapping import FOREIGN_KEYS, MAPPING, TABLE_PKS
from config.raw_rules import RAW_TABLES
from pipeline import (step9_cdc_to_lake, step10_load_dimensions, step11_load_facts,
                      step12_build_gold)
from pipeline.step1_extract import extract, list_days, local_fingerprints
from pipeline.step2_clean import clean
from pipeline.step3_validate import validate
from pipeline.step4_transform import to_3nf
from pipeline.step5_keys import check_foreign_keys
from pipeline.step6_load import load
from utils import checkpoint, delta_store
from utils.oltp_store import latest_per_key


def run_day(day):
    """Steps 1-6 for one day: raw files -> validated 3NF rows merged into the OLTP Delta tables."""
    day = day.rstrip("/")
    force = os.getenv("PAYU_FORCE_REPROCESS") == "1"
    refresh = os.getenv("PAYU_REFRESH_RAW") == "1"       # download the raw files again
    done = checkpoint.get(day)

    # LOAD CDC: a finished day is loaded again only if a raw file is new or its content changed.
    if done and not force and not refresh:
        now = local_fingerprints(day)
        if not now or checkpoint.fingerprint_text(now) == done["fingerprint"]:
            print(f"⏭️  {day} unchanged since the last load. Skipping.")
            return

    print(f"\n===== {day} =====")
    pieces, rejected = defaultdict(list), {}

    extracted, prints = extract(f"{day}/", refresh)
    if not extracted:
        print(f"No raw files found under {day}/; checkpoint not saved.")
        return
    if done and not force and checkpoint.fingerprint_text(prints) == done["fingerprint"]:
        print(f"⏭️  {day} raw files identical to the last load. Skipping.")
        return
    if done:
        print(f"  raw files changed since load #{int(done['load_count'])} - loading the day again")

    for raw_name, raw_df in extracted.items():
        df = clean(raw_df)
        good, bad = validate(df, RAW_TABLES[raw_name])
        print(f"  {raw_name:<30} {len(df):>6} rows -> {len(good)} good, {len(bad)} rejected")

        if len(bad):
            rejected[raw_name] = bad
        for table, part in to_3nf(good, MAPPING[raw_name]).items():
            pieces[table].append(part)

    tables = {t: latest_per_key(pd.concat(p, ignore_index=True), TABLE_PKS[t]) for t, p in pieces.items()}
    tables, orphans = check_foreign_keys(tables, FOREIGN_KEYS)
    load(day, tables, {**rejected, **orphans}, TABLE_PKS)

    checkpoint.mark_completed(day, prints, done)      # ONLY after the load succeeded
    print(f"✅ {day} completed and checkpoint saved.")


def run_oltp(target):
    """target = '2025/12/22' (day), '2025/12' (month) or '2025' (year)."""
    delta_store.ensure_storage()
    target = target.strip("/") + "/"
    days = [target] if target.count("/") == 3 else list_days(target)
    if not days:
        print(f"No files found under {target}")
    for day in days:
        run_day(day)


def run_warehouse():
    """Steps 9-12, each one incremental (see README "CDC design").
    PAYU_FULL_REFRESH=1 ignores every warehouse checkpoint and rebuilds from the whole change history."""
    delta_store.ensure_storage()
    full = os.getenv("PAYU_FULL_REFRESH") == "1"
    print("\n== Step 9  validated -> data lake (change feed) ==")
    step9_cdc_to_lake.main()
    print("\n== Step 10 dimensions ==")
    dims = step10_load_dimensions.main(full)
    print("\n== Step 11 facts ==")
    facts = step11_load_facts.main(full)
    print("\n== Step 12 gold ==")
    step12_build_gold.main(full=full, dates=facts["dates"],
                           full_gold=facts["full_gold"] or bool(dims["scd1_updated"]))


def run_all(target):
    run_oltp(target)
    run_warehouse()
