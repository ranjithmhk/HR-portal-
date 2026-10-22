# Databricks notebook source
# MAGIC %md
# MAGIC # PayU ETL on Databricks
# MAGIC Raw CSVs → 3NF Delta tables (OLTP) → CDC lake (Change Data Feed) → star schema → gold.
# MAGIC Fill in the widgets above and **Run all**. See `../README.md` for setup.

# COMMAND ----------

dbutils.widgets.text("target", "2025/12/22", "Day / month / year to load (2025/12/22, 2025/12, 2025)")
dbutils.widgets.dropdown("stages", "all", ["all", "oltp_only", "warehouse_only"], "Stages to run")
dbutils.widgets.text("storage_root", "/Volumes/main/payu/storage/payu", "Storage root (a UC volume path)")
dbutils.widgets.dropdown("source", "api", ["api", "folder"], "Raw source (api = download, folder = files already in <root>/raw)")
dbutils.widgets.text("secret_scope", "payu", "Secret scope holding BASE_URL and PII_SALT")
dbutils.widgets.dropdown("force_reprocess", "no", ["no", "yes"], "Reload days even if their raw files are unchanged?")
dbutils.widgets.dropdown("refresh_raw", "no", ["no", "yes"], "Download raw files again and reload days whose content changed?")
dbutils.widgets.dropdown("full_refresh", "no", ["no", "yes"], "Rebuild the whole warehouse from the change history (ignore checkpoints)?")

# COMMAND ----------

# Environment MUST be set before the project modules are imported (config/settings.py reads it).
import os, sys

os.environ["PAYU_STORAGE_ROOT"] = dbutils.widgets.get("storage_root")
os.environ["PAYU_SOURCE"] = dbutils.widgets.get("source")
os.environ["PAYU_FORCE_REPROCESS"] = "1" if dbutils.widgets.get("force_reprocess") == "yes" else "0"
os.environ["PAYU_REFRESH_RAW"] = "1" if dbutils.widgets.get("refresh_raw") == "yes" else "0"
os.environ["PAYU_FULL_REFRESH"] = "1" if dbutils.widgets.get("full_refresh") == "yes" else "0"

scope = dbutils.widgets.get("secret_scope")
for env_name, secret_key in (("BASE_URL", "base_url"), ("PII_SALT", "pii_salt")):
    try:
        os.environ[env_name] = dbutils.secrets.get(scope, secret_key)
    except Exception:
        print(f"! secret {scope}/{secret_key} not found - {env_name} not set")

# The notebook lives in <project>/notebooks, the code in <project>
project_root = os.path.dirname(os.getcwd())
sys.path.insert(0, project_root)

# COMMAND ----------

import main

target, stages = dbutils.widgets.get("target"), dbutils.widgets.get("stages")
if stages in ("all", "oltp_only"):
    main.run_oltp(target)
if stages in ("all", "warehouse_only"):
    main.run_warehouse()

# COMMAND ----------

# MAGIC %md ## What is stored where

# COMMAND ----------

from config import settings as s

for layer in (s.RAW, s.VALIDATED, s.DATALAKE, s.DATAWAREHOUSE, s.OPS):
    try:
        names = [f.name for f in dbutils.fs.ls(s.path(layer))]
    except Exception:
        names = []
    print(f"{s.path(layer)}  ({len(names)} items)")
    for n in names[:40]:
        print("   ", n)

# COMMAND ----------

# Example: read a gold table straight from its folder
display(spark.read.format("delta").load(s.path(s.DATAWAREHOUSE, "gold_daily_merchant_performance")).limit(20))
