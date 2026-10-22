"""PII rules, applied in step 9 before anything enters the analytical lake.
OLTP keeps the real values (operations need them); the lake and everything after it don't.

  HASH  -> salted SHA-256: unreadable, but still countable and joinable
           (unique customers, fraud checks per IP still work)
  DROP  -> removed: analytics never needs them
"""
import os
from pyspark.sql import functions as F

HASH = ["customer_email", "customer_phone", "ip_address",
        "merchant_email", "contact_email", "contact_phone", "support_email"]
DROP = ["customer_name", "contact_person_name", "account_holder_name", "merchant_tax_id",
        "latitude", "longitude", "user_agent", "token_id"]


def mask_pii(sdf):
    """Spark DataFrame in -> Spark DataFrame out (same hash as sha256(salt + value))."""
    salt = os.getenv("PII_SALT", "change-me")      # keep the real salt in a secret scope
    sdf = sdf.drop(*[c for c in DROP if c in sdf.columns])
    for col in [c for c in HASH if c in sdf.columns]:
        sdf = sdf.withColumn(col, F.sha2(F.concat(F.lit(salt), F.col(col).cast("string")), 256))
    return sdf
