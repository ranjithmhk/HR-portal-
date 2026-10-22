"""Warehouse checkpoints: how far each consumer has read, stored in <ROOT>/_ops/dw_checkpoint.

   consumer        source           value
   dim:dim_merchant   merchant          last lake _change_id that was loaded into the dimension
   fact:fact_refund   refund            last lake _change_id loaded into the fact
   fact:fact_refund   dim:dim_merchant  the dimension revision the fact was last built against
   dim_revision    dim_merchant      +1 every time the dimension really changed

A checkpoint moves ONLY after the data of that run is written. A crash in between repeats the same
changes next time, and the MERGEs make that harmless."""
import pandas as pd
from config import settings
from utils import delta_store

TABLE = "dw_checkpoint"


def get(consumer):
    df = delta_store.read_pandas(settings.OPS, TABLE)
    if df.empty:
        return {}
    df = df[df["consumer"] == consumer]
    return dict(zip(df["source"], df["value"].astype(int)))


def put(consumer, values):
    if not values:
        return
    rows = pd.DataFrame({"consumer": consumer, "source": list(values), "value": [int(v) for v in values.values()]})
    delta_store.upsert(settings.OPS, TABLE, rows, ["consumer", "source"])
