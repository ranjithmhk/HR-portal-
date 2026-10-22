"""Star-schema dimensions (study guide section 13).

  sk           surrogate key column (warehouse key: 1, 2, 3 ...; -1 = Unknown)
  key          business key from the OLTP (e.g. merchant_id)
  scd          1 = overwrite   2 = keep history (new row per change)
  tracked      SCD2 only: a change in these columns creates a new version (row_hash).
               Every other column is Type 1: it always shows the latest value.
  source       lake tables, joined on key (first table = main table)
  date         SCD2 only: column saying WHEN a change became valid
               (default "_changed_at" = when the change reached the OLTP)
  columns      descriptive columns to keep
  values_from  small lookup dimensions: distinct values from (table, {column: new_name})
"""
DATE_RANGE = ("2025-01-01", "2026-12-31")    # rows of dim_date

FLAGS = ["is_3ds_enabled", "is_retry", "is_fraud_flagged", "is_smart_routed", "is_timeout", "is_user_dropped"]

DIMENSIONS = {
    # ---------------- entity dimensions ----------------
    "dim_merchant": {
        "sk": "merchant_key", "key": ["merchant_id"], "scd": 2,
        "source": ["merchant", "merchant_snapshot"], "date": "effective_from",
        "tracked": ["merchant_name", "merchant_category_code", "merchant_business_type",
                    "risk_tier", "kyc_status", "account_status", "settlement_cycle"],
        "columns": ["merchant_name", "merchant_legal_name", "merchant_category_code",
                    "merchant_business_type", "merchant_country", "merchant_state", "merchant_city",
                    "merchant_tier", "merchant_integration_type", "merchant_onboarding_date",
                    "parent_merchant_id", "risk_tier", "kyc_status", "account_status",
                    "settlement_cycle", "is_live", "is_international_enabled"]},
    "dim_customer": {      # PII (name, email, phone) stays in the OLTP
        "sk": "customer_key", "key": ["customer_id"], "scd": 2, "source": ["customer"],
        "tracked": ["customer_country", "customer_state"],
        "columns": ["customer_country", "customer_state", "customer_created_date"]},
    "dim_gateway": {
        "sk": "gateway_key", "key": ["gateway_id"], "scd": 2, "source": ["payment_gateway"],
        "tracked": ["gateway_name", "gateway_type", "acquirer_bank_id"],
        "columns": ["gateway_name", "gateway_type", "acquirer_bank_id"]},
    "dim_payment_instrument": {   # no token / fingerprint / VPA hash in the warehouse
        "sk": "instrument_key", "key": ["instrument_id"], "scd": 1, "source": ["payment_instrument"],
        "columns": ["card_bin", "card_last4", "card_type", "card_network", "card_category",
                    "card_country", "wallet_provider", "netbanking_bank_code", "bnpl_provider",
                    "issuer_bank_id"]},
    "dim_bank": {
        "sk": "bank_key", "key": ["bank_id"], "scd": 1, "source": ["bank"],
        "columns": ["bank_name", "bank_code"]},
    "dim_device": {
        "sk": "device_key", "key": ["device_id"], "scd": 1, "source": ["device"],
        "columns": ["device_type", "device_brand", "device_model", "operating_system",
                    "os_version", "browser", "app_platform"]},
    "dim_response_code": {
        "sk": "response_code_key", "key": ["response_code"], "scd": 1, "source": ["response_code"],
        "columns": ["response_message", "failure_category"]},

    # ---------------- small lookup dimensions ----------------
    "dim_payment_mode": {
        "sk": "payment_mode_key", "key": ["payment_mode"], "scd": 1,
        "values_from": [("payment_transaction", {"payment_mode": "payment_mode"}),
                        ("merchant_payment_mode", {"payment_mode": "payment_mode"})]},
    "dim_txn_status": {
        "sk": "txn_status_key", "key": ["txn_status"], "scd": 1,
        "values_from": [("payment_transaction", {"txn_status": "txn_status"})]},
    "dim_entry_type": {
        "sk": "entry_type_key", "key": ["entry_type"], "scd": 1,
        "values_from": [("ledger_entry", {"entry_type": "entry_type"})]},
    "dim_currency": {
        "sk": "currency_key", "key": ["currency"], "scd": 1,
        "values_from": [("payment_transaction", {"txn_currency": "currency"}),
                        ("ledger_entry", {"currency": "currency"}),
                        ("settlement", {"settlement_currency": "currency"})]},
    "dim_settlement_mode": {
        "sk": "settlement_mode_key", "key": ["settlement_mode"], "scd": 1,
        "values_from": [("settlement", {"settlement_mode": "settlement_mode"})]},
    "dim_geography": {
        "sk": "geography_key", "key": ["country", "city"], "scd": 1,
        "values_from": [("payment_transaction", {"ip_country": "country", "ip_city": "city"})]},
    "dim_txn_flags": {     # junk dimension: every combination of the yes/no flags
        "sk": "txn_flags_key", "key": FLAGS, "scd": 1,
        "values_from": [("payment_transaction", {f: f for f in FLAGS})]},
}