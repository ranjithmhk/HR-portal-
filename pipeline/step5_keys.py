"""STEP 5 - KEY CHECK: every foreign key must point to a parent that exists
(either already in the validated tables, or arriving today). Orphans go to quarantine."""
import pandas as pd
from config import settings
from utils import delta_store


def check_foreign_keys(tables, foreign_keys):
    rejected = {}
    for child, col, parent in foreign_keys:
        if child not in tables or col not in tables[child]:
            continue
        known = delta_store.read_column(settings.VALIDATED, parent.lower(), col)
        if parent in tables:
            known |= set(tables[parent][col])

        df = tables[child]
        orphan = df[col].notna() & ~df[col].isin(known)
        if orphan.any():
            bad = df[orphan].assign(reject_reason=f"{col} not found in {parent}")
            rejected[child] = pd.concat([rejected.get(child), bad])
            tables[child] = df[~orphan]
    return tables, rejected
