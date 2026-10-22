# PayU ETL — runs entirely in Databricks

Same pipeline as `../payu_etl/`, but nothing runs on your laptop: no Postgres, no local
parquet folders, no S3 uploads. Every layer is a Delta table.

```
<storage root>/
├── raw/pay_u/2025/12/22/*.csv      landing zone: the 3 raw CSVs per day, untouched
├── validated/                      steps 1-6: cleaned, validated 3NF tables (Delta, MERGE by primary key)
│   ├── merchant/  customer/  payment_transaction/ ...   (was: Postgres)
│   └── quarantine/                 rejected rows + reject_reason + the row as JSON
├── datalake/                       step 9: masked change log of every table (was: data/lake/cdc)
│   └── merchant/  payment_transaction/ ...              (PII hashed or dropped)
├── datawarehouse/                  steps 10-12 (was: Postgres schema dw)
│   ├── dim_*/  fact_*/             star schema
│   └── gold_*/                     dashboard tables
└── _ops/                           day_checkpoint, cdc_checkpoint
```
Every folder under `validated/`, `datalake/`, `datawarehouse/` and `_ops/` is a Delta table.
CDC = Delta Change Data Feed (switched on when each validated table is created).

## Setup (once)

1. **Put the folder in Databricks**: Git folder (Repos) pointing at this repo, or upload
   `databricks_etl/` to your workspace. Keep the layout — the notebook finds the code in its parent folder.
2. **Storage root** (`storage_root` widget). Default `/Volumes/main/payu/storage/payu`: the schema
   `main.payu` and volume `storage` are created for you (needs `CREATE SCHEMA` / `CREATE VOLUME`).
   Use a volume path (a managed volume, or an external volume over your S3 / ADLS location):
   the raw CSVs are read and written with normal file I/O, which needs a `/Volumes/...` or `/dbfs/...` path.
3. **Secrets** (needed for `source = api`; PII salt always):
   ```bash
   databricks secrets create-scope payu
   databricks secrets put-secret payu base_url   # the training API url (BASE_URL from payu_etl/.env)
   databricks secrets put-secret payu pii_salt   # any long random string - keep it stable
   ```
   Without `pii_salt` the hash salt falls back to `change-me`.
4. **Cluster**: Databricks Runtime 13.3 LTS+ (or serverless), outbound internet for the API source.

No API access from the workspace? Upload the raw files yourself to
`<storage root>/raw/pay_u/2025/12/22/PAYMENT_TRANSACTION_RAW.csv` (and the other two) and set
`source = folder`. With `source = api` every downloaded file is saved there too, so the raw layer
always holds what was received.

## Run

Open `notebooks/run_payu_etl.py`, fill the widgets, **Run all**.

| Widget | Meaning |
|---|---|
| `target` | `2025/12/22` (day), `2025/12` (month) or `2025` (year) |
| `stages` | `all`, `oltp_only` (steps 1-6), `warehouse_only` (steps 9-12) |
| `storage_root` / `source` / `secret_scope` | see above |
| `force_reprocess` | `yes` = reload days even if their raw files did not change |
| `refresh_raw` | `yes` = download the raw files again; days whose content changed are reloaded |
| `full_refresh` | `yes` = rebuild dimensions, facts and gold from the whole change history |

To schedule it, create a Databricks Job with this notebook as the task and pass the widgets as
parameters (`target`, `stages`, ...).

From any Python cell: `import main; main.run_all("2025/12/22")`.

## CDC design

Change data capture at every hop, so a daily run touches only what changed.

| Hop | What identifies a change | What is skipped / written |
|---|---|---|
| **raw → validated** | SHA-256 of each raw file, stored in `_ops/day_checkpoint` | Day with identical files: skipped. New file for the day, or a restated file: the day is loaded again (the old raw copy is kept as `*.prev`). Per table the MERGE reports `inserted / updated / unchanged` → `_ops/load_audit` |
| **validated → data lake** | Delta Change Data Feed, checkpoint = last Delta version per table (`_ops/cdc_checkpoint`) | Only versions after the checkpoint; PII hashed/dropped; one row per change (`_op` I/U/D, `_change_id`, `_changed_at`) |
| **data lake → dimensions** | checkpoint per dimension and source table (`_ops/dw_checkpoint`) | No new change: skipped. SCD2 dimensions read the **change log**, so two changes between runs give two versions. Unchanged rows keep their surrogate key; only real changes are written |
| **data lake → facts** | checkpoint per fact and source table + dimension revision | Only *affected* rows are rebuilt and MERGEd (below) |
| **facts → gold** | the dates of the fact rows that really changed | Only those dates are recomputed and swapped in atomically (`replaceWhere`) |

**A fact row is rebuilt when**
1. its base record changed (new payment, status update);
2. a record it joins with changed (an order moved to another merchant);
3. it points to the *Unknown* member (`-1`) and one of its dimensions changed — **late-arriving dimensions**: payments that arrive before their merchant are loaded with `-1` and fixed automatically when the merchant shows up;
4. its source record was deleted (the fact row is deleted too).

**Business rules built in**
- Dimension keys are looked up *as of the transaction date* (SCD2): a merchant's new risk tier never rewrites old payments.
- Money in gold comes from the ledger, rates are recomputed from counts (unchanged from `payu_etl`).
- A Type 1 dimension attribute that gets overwritten (e.g. a bank renamed) triggers a full gold rebuild, because old gold rows carry the old name.
- Daily-snapshot facts (grain merchant × day) are rebuilt in full when their source changed, because "newest snapshot wins" needs all rows; only rows whose values differ are written.
- Every checkpoint moves *after* the data is written; a crash repeats the same changes and the MERGEs absorb it (at-least-once + idempotent = effectively once).
- Limits: SCD2 history has day granularity (two changes on the same day = one version); a row removed from a restated raw file is not deleted downstream; a dimension version back-dated before existing facts needs `full_refresh`.

## What changed vs `payu_etl/`

| payu_etl | databricks_etl |
|---|---|
| Postgres 3NF tables, `ON CONFLICT` upsert | Delta tables in `validated/`, `MERGE` with the same rule: an empty new value never wipes an old one |
| `step7` copy to Postgres, `step8` CDC triggers | not needed - Change Data Feed is switched on when each table is created |
| `step9` reads `cdc_audit` | reads the change feed after the last checkpointed Delta version; `_change_id` = Delta version |
| Dimensions / facts / gold rebuilt in full on every run | incremental (see CDC design) |
| Day skipped once finished | day reloaded when its raw files changed |
| SQL `ALTER TABLE ... PRIMARY KEY` | not enforced on Delta; gold step prints a warning if a key repeats |
| Gold SQL in Postgres | same queries in Spark SQL (`NUMERIC` → `DECIMAL(28,6)`), written to `datawarehouse/gold_*` |
| `.env`, local `data/` folders | notebook widgets + secret scope, the storage root above |

Unchanged pandas logic (copied as-is): `step2_clean`, `step3_validate`, `step4_transform`,
`utils/scd.py`, `utils/fact_keys.py`, all of `config/` except `settings.py`, `pii.py`, `gold.py`.
`dashboard.py` (Streamlit) and the Tableau workbook are not part of this folder; point them at
`datawarehouse/gold_*` (e.g. register them as tables for a Databricks SQL warehouse) if you want them.

## Scaling

Cleaning/validation/SCD run in pandas on the driver and results move through
`utils/delta_store.py` (`toPandas` / `createDataFrame`). Because dimensions and facts are now
incremental, a normal daily run only moves the changed rows; a first load or `full_refresh` moves
everything. If the facts grow past a few million rows, rewrite `build_fact` in Spark.

## Notes

- Re-running anything is safe: MERGE is idempotent and Change Data Feed only records rows that really changed.
- A ledger row whose payment is unknown goes to `validated/quarantine`. Load the payment's day
  first, then reload the ledger's day (`force_reprocess = yes`).
- What a load did: `SELECT * FROM delta.`<storage root>/_ops/load_audit``; rejected rows:
  `... /validated/quarantine` (filter on `day`).
- Tables are path-based (not registered in a catalog). To query one by name in SQL:
  `CREATE TABLE main.payu.gold_daily_merchant_performance USING DELTA LOCATION '<storage root>/datawarehouse/gold_daily_merchant_performance'`.
