"""All settings in one place. Values come from environment variables, which the notebook
sets from its widgets / secrets BEFORE importing anything from this project."""
import os

# ---- Where the data lives: ONE storage root, one folder per layer ----
#   <ROOT>/raw/pay_u/2025/12/22/*.csv     landing zone: the raw CSVs, exactly as received
#   <ROOT>/validated/<table>              cleaned + validated 3NF tables (Delta) + quarantine
#   <ROOT>/datalake/<table>               masked change log of every table (Delta)
#   <ROOT>/datawarehouse/<name>           dim_*, fact_*, gold_* (Delta)
#   <ROOT>/_ops/<name>                    day + CDC checkpoints
# ROOT can be a Unity Catalog volume (/Volumes/<catalog>/<schema>/<volume>/payu - created for you),
# (an external volume over S3 / ADLS works too). Raw files use normal file I/O, so use a volume path.
ROOT = os.getenv("PAYU_STORAGE_ROOT", "/Volumes/main/payu/storage/payu").rstrip("/")

RAW, VALIDATED, DATALAKE, DATAWAREHOUSE, OPS = "raw", "validated", "datalake", "datawarehouse", "_ops"


def path(layer, name=None):
    """path("datawarehouse", "dim_merchant") -> '<ROOT>/datawarehouse/dim_merchant'"""
    return f"{ROOT}/{layer}" + (f"/{name}" if name else "")


# ---- Where raw files come from ----
# "api"    = S3 through the training HTTP API (needs BASE_URL); each file is also saved under raw/
# "folder" = CSVs already in <ROOT>/raw/pay_u/2025/12/22/  (upload them there yourself)
SOURCE = os.getenv("PAYU_SOURCE", "api")
BASE_URL = os.getenv("BASE_URL")
PROJECT = "pay_u"

# ---- Column types are decided by the column NAME (step 2) ----
NUMBER_ENDINGS = ("_amount", "_fee", "_percent", "_ms", "_seconds", "_count", "_rate",
                  "_ratio", "_score", "_value", "_size", "_months", "_minutes",
                  "gst_on_mdr", "additional_charges", "attempt_number", "txn_hour",
                  "latitude", "longitude")
DATE_ENDINGS = ("_timestamp", "_date", "_time", "effective_from", "effective_to")
BOOL_PREFIX = "is_"
UPPER_ENDINGS = ("_status", "currency", "_type", "_mode", "_direction", "_stage",
                 "_outcome", "_decision", "_tier", "_category")
