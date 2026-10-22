"""Load checkpoint: one row per day in <ROOT>/_ops/day_checkpoint (replaces _SUCCESS.json in S3).

  fingerprint   JSON {raw file: sha256} of the files that were loaded
  load_count    how many times the day was loaded (2+ = a restated file was reloaded)

Written ONLY after a day loaded successfully. main.run_day compares the fingerprint of today's
files with it: same -> skip, different or new file -> load again (MERGE makes that safe)."""
import json
import pandas as pd
from config import settings
from utils import delta_store

TABLE = "day_checkpoint"


def get(day):
    df = delta_store.read_pandas(settings.OPS, TABLE)
    if df.empty:
        return None
    row = df[df["day"] == day.rstrip("/")]
    return row.iloc[0].to_dict() if len(row) else None


def fingerprint_text(prints):
    return json.dumps(prints, sort_keys=True)


def mark_completed(day, prints, previous=None):
    count = int(previous["load_count"]) + 1 if previous and pd.notna(previous.get("load_count")) else 1
    row = pd.DataFrame({"day": [day.rstrip("/")], "status": ["SUCCESS"], "load_count": [count],
                        "fingerprint": [fingerprint_text(prints)],
                        "completed_at": [pd.Timestamp.now(tz="UTC")]})
    delta_store.upsert(settings.OPS, TABLE, row, ["day"])
