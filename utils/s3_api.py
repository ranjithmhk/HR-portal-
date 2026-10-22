"""Read raw files from S3 through the training API (no AWS keys needed)."""
import requests
from config.settings import BASE_URL, PROJECT


def list_files(path):
    """path like '2025/12/' -> list of S3 keys under it."""
    r = requests.get(f"{BASE_URL}/files", params={"project": PROJECT, "path": path}, timeout=60)
    r.raise_for_status()
    return [f["key"] for f in r.json()["files"]]


def download(path):
    """path like '2025/12/22/PAYMENT_TRANSACTION_RAW.csv' -> the file's bytes."""
    r = requests.get(f"{BASE_URL}/download", params={"project": PROJECT, "path": path}, timeout=60)
    r.raise_for_status()
    result = r.json()
    url = result.get("download_url") or result.get("url")
    if not url:
        raise ValueError(f"No download URL in response: {result}")
    file = requests.get(url, timeout=300)
    file.raise_for_status()
    return file.content
