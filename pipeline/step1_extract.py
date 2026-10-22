"""STEP 1 - EXTRACT: read the raw CSV files of one day and fingerprint them.

Landing zone = <ROOT>/raw/pay_u/YYYY/MM/DD/*.csv   (a volume path: it is read with normal file I/O).
With SOURCE="api" a file is downloaded once and saved there, so the raw layer keeps an untouched
copy and later runs read that copy. refresh=True downloads again; if the content changed, the old
copy is kept next to it as <name>.csv.<oldhash>.prev (nothing is overwritten without a trace).

The SHA-256 of each file is the fingerprint used by the load CDC (main.run_day): a day is
reloaded only when a file is new or its content changed."""
import hashlib
import io
import os
import pandas as pd
import requests
from config import settings
from config.raw_rules import RAW_TABLES
from utils import s3_api


def _local(day, name):
    return os.path.join(settings.path(settings.RAW, settings.PROJECT), day.rstrip("/"), f"{name}.csv")


def _sha(content):
    return hashlib.sha256(content).hexdigest()


def local_fingerprints(day):
    """{raw_name: sha256} of the files already in the landing zone (no network)."""
    result = {}
    for name in RAW_TABLES:
        path = _local(day, name)
        if os.path.exists(path):
            with open(path, "rb") as f:
                result[name] = _sha(f.read())
    return result


def read_raw(day, name, refresh=False):
    """-> (DataFrame, sha256), or (None, None) if the file is missing."""
    file = f"{day.rstrip('/')}/{name}.csv"
    local = _local(day, name)
    try:
        if os.path.exists(local) and not refresh:
            with open(local, "rb") as f:
                content = f.read()
        elif settings.SOURCE == "folder":
            raise FileNotFoundError(local)
        else:
            content = s3_api.download(file)                         # bytes exactly as received
            os.makedirs(os.path.dirname(local), exist_ok=True)
            if os.path.exists(local):
                with open(local, "rb") as f:
                    old = f.read()
                if _sha(old) != _sha(content):                      # restated file: keep the old one
                    with open(f"{local}.{_sha(old)[:8]}.prev", "wb") as f:
                        f.write(old)
            with open(local, "wb") as f:
                f.write(content)
        return pd.read_csv(io.BytesIO(content), dtype=str), _sha(content)
    except (FileNotFoundError, requests.HTTPError) as error:
        print(f"  ! {file} not found ({error.__class__.__name__}) - skipped")
        return None, None


def extract(day, refresh=False):
    """All raw files of one day -> ({raw_name: DataFrame}, {raw_name: sha256}).
    Everything is read as text on purpose (keeps leading zeros like card_last4='0042');
    step 2 converts the types."""
    frames, prints = {}, {}
    for name in RAW_TABLES:
        df, sha = read_raw(day, name, refresh)
        if df is not None:
            frames[name], prints[name] = df, sha
    return frames, prints


def list_days(prefix):
    """'2025/12/' -> ['2025/12/01/', '2025/12/02/', ...] (days that have files)."""
    if settings.SOURCE == "folder":
        base = settings.path(settings.RAW, settings.PROJECT)
        keys = [os.path.relpath(os.path.join(d, f), base)
                for d, _, files in os.walk(os.path.join(base, prefix)) for f in files if f.endswith(".csv")]
    else:
        keys = [k.split("/", 1)[1] for k in s3_api.list_files(prefix)]   # drop 'pay_u/'
    return sorted({"/".join(k.split("/")[:3]) + "/" for k in keys})
