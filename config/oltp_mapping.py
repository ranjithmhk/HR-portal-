"""Which raw column goes to which 3NF table (follows the study guide, sections 4, 8 and 9).

Each table spec:
  pk        primary key column(s)
  columns   list of raw columns  ("col"  or  ("raw_name", "new_name") to rename)
            REST = every raw column not used by another table (+ "keep", - "skip")
  sources   instead of columns: several column lists stacked on top of each other
  split     a multi-value cell ("UPI|CC|NB") becomes one row per value
  required  rows with these empty are not part of this table (default: pk)
"""
REST = "REST"

SNAPSHOT_COLS = ["snapshot_id", "snapshot_timestamp", "effective_from", "effective_to",
                 "is_current", "change_type"]
AUDIT_COLS = ["source_system", "schema_version", "ingestion_timestamp", "partition_date",
              "batch_id", "file_name", "record_hash"]

MAPPING = {
    # ------------------------------------------------------------------ 143 columns
    "PAYMENT_TRANSACTION_RAW": {
        "MERCHANT": {"pk": ["merchant_id"], "columns": [
            "merchant_id", "merchant_name", "merchant_legal_name", "merchant_category_code",
            "merchant_business_type", "merchant_country", "merchant_city",
            "merchant_website_url", "merchant_onboarding_date"]},
        "CUSTOMER": {"pk": ["customer_id"], "columns": [
            "customer_id", "customer_name", "customer_email", "customer_phone",
            "customer_country", "customer_state", "customer_created_date"]},
        "PAYMENT_ORDER": {"pk": ["order_id"], "columns": [
            "order_id", "merchant_id", "customer_id", "order_amount", "order_currency",
            "order_description", "order_created_timestamp", "order_expiry_timestamp",
            "coupon_code", "discount_amount", "merchant_udf_json"]},
        "CHECKOUT_SESSION": {"pk": ["checkout_session_id"], "columns": [
            "checkout_session_id", "order_id", "device_id", "checkout_start_time",
            "checkout_end_time", "checkout_duration_seconds", "checkout_channel",
            "checkout_flow_type", "is_guest_checkout", "sdk_version"]},
        "DEVICE": {"pk": ["device_id"], "columns": [
            "device_id", "device_type", "device_brand", "device_model", "operating_system",
            "os_version", "browser", "browser_version", "app_platform", "screen_resolution"]},
        "PAYMENT_INSTRUMENT": {"pk": ["instrument_id"], "columns": [
            "instrument_id", "card_bin", "card_last4", "card_type", "card_network",
            "card_category", "card_country", "card_fingerprint", "token_id", "upi_vpa_hash",
            "wallet_provider", "netbanking_bank_code", "bnpl_provider", "issuer_bank_id"]},
        "PAYMENT_GATEWAY": {"pk": ["gateway_id"], "columns": [
            "gateway_id", "gateway_name", "acquirer_bank_id"]},
        "BANK": {"pk": ["bank_id"], "sources": [         # one BANK table, two roles
            [("acquirer_bank_id", "bank_id"), ("acquirer_bank_name", "bank_name")],
            [("issuer_bank_id", "bank_id"), ("issuer_bank_name", "bank_name")]]},
        "RESPONSE_CODE": {"pk": ["response_code"], "columns": [
            "response_code", "response_message", "failure_category"]},
        "PAYMENT_TRANSACTION": {"pk": ["payment_txn_id"], "columns": REST,
            "keep": ["order_id", "checkout_session_id", "instrument_id", "gateway_id", "response_code"],
            "skip": ["merchant_risk_tier"]},   # point-in-time value -> comes from the snapshot file
    },
    # ------------------------------------------------------------------ 93 columns
    "SETTLEMENT_LEDGER_RAW": {
        "MERCHANT": {"pk": ["merchant_id"], "columns": [
            "merchant_id", "merchant_name", "merchant_legal_name", "merchant_email",
            "merchant_country", "merchant_tax_id", "merchant_tier", "merchant_account_status",
            "merchant_onboarding_date"]},
        "MERCHANT_BANK_ACCOUNT": {"pk": ["merchant_bank_account_id"], "columns": [
            "merchant_bank_account_id", "merchant_id", "account_holder_name", "ifsc_code",
            "account_number_masked", "account_type", "is_verified_account"]},
        "REFUND": {"pk": ["refund_id"], "columns": [
            "refund_id", "payment_txn_id", "refund_type", "refund_status", "refund_reason",
            "refund_initiated_date", "refund_completed_date", "refund_arn", "refund_requested_by"]},
        "CHARGEBACK": {"pk": ["chargeback_id"], "columns": [
            "chargeback_id", "payment_txn_id", "chargeback_reason_code", "chargeback_stage",
            "chargeback_status", "chargeback_received_date", "response_due_date",
            "is_evidence_submitted", "chargeback_outcome"]},
        "SETTLEMENT": {"pk": ["settlement_utr"], "columns": [
            "settlement_id", "merchant_id", "merchant_bank_account_id", "settlement_status",
            "settlement_date", "settlement_initiated_timestamp", "settlement_utr",
            "settlement_mode", "settlement_currency", "settlement_amount", "is_on_hold",
            "hold_reason", "rolling_reserve_amount"]},
        "LEDGER_ENTRY": {"pk": ["ledger_entry_id"], "columns": REST,
            "keep": ["payment_txn_id", "settlement_utr", "refund_id", "chargeback_id"],
            # payment context is already stored from the payment file; reach it via payment_txn_id
            "skip": ["order_id", "customer_id", "payment_mode", "card_network", "gateway_id",
                     "gateway_name", "txn_amount", "txn_timestamp", "bank_name"]},
    },
    # ------------------------------------------------------------------ 69 columns
    "MERCHANT_GATEWAY_SNAPSHOT_RAW": {
        "MERCHANT": {"pk": ["merchant_id"], "columns": [
            "merchant_id", "merchant_name", "merchant_legal_name", "merchant_display_name",
            "merchant_category_code", "merchant_business_type", "merchant_website_url",
            "merchant_logo_url", "merchant_country", "merchant_state", "merchant_city",
            "merchant_incorporation_date", "merchant_onboarding_date", "merchant_tax_id",
            "merchant_integration_type", "parent_merchant_id", "contact_person_name",
            "contact_email", "contact_phone", "support_email", "relationship_manager_id"]},
        "MERCHANT_PAYMENT_MODE": {"pk": ["merchant_id", "payment_mode"], "split": "payment_mode",
            "columns": ["merchant_id", ("enabled_payment_modes", "payment_mode")]},
        "MERCHANT_SNAPSHOT": {"pk": ["snapshot_id"], "required": ["snapshot_id", "merchant_id"],
            "columns": SNAPSHOT_COLS + ["merchant_id",
                "kyc_status", "kyc_verified_date", "risk_tier", "account_status", "is_live",
                "is_international_enabled", "is_subscription_enabled", "pci_compliance_status",
                "settlement_cycle", "total_txn_count", "successful_txn_count", "failed_txn_count",
                "gross_merchandise_value", "success_rate_percent", "average_ticket_size",
                "refund_count", "chargeback_count", "chargeback_ratio"] + AUDIT_COLS},
        "GATEWAY_SNAPSHOT": {"pk": ["snapshot_id"], "required": ["snapshot_id", "gateway_id"],
            "columns": SNAPSHOT_COLS + ["gateway_id", "payment_mode", "attempt_count",
                "success_count",
                # the raw file has success_rate_percent twice; pandas names the 2nd one ".1"
                ("success_rate_percent.1", "success_rate_percent"),
                "avg_response_time_ms", "p95_latency_ms", "timeout_rate_percent",
                "downtime_minutes", "gateway_status"] + AUDIT_COLS},
        "PAYMENT_GATEWAY": {"pk": ["gateway_id"], "columns": [
            "gateway_id", "gateway_name", "acquirer_bank_id", "gateway_type"]},
        "BANK": {"pk": ["bank_id"], "columns": ["bank_id", "bank_name", "bank_code"]},
    },
}

# Primary key of every 3NF table (collected from MAPPING)
TABLE_PKS = {t: spec["pk"] for tables in MAPPING.values() for t, spec in tables.items()}

# (child table, column, parent table) - parents listed before children
FOREIGN_KEYS = [
    ("PAYMENT_ORDER", "merchant_id", "MERCHANT"),
    ("PAYMENT_ORDER", "customer_id", "CUSTOMER"),
    ("CHECKOUT_SESSION", "order_id", "PAYMENT_ORDER"),
    ("CHECKOUT_SESSION", "device_id", "DEVICE"),
    ("PAYMENT_TRANSACTION", "order_id", "PAYMENT_ORDER"),
    ("PAYMENT_TRANSACTION", "checkout_session_id", "CHECKOUT_SESSION"),
    ("PAYMENT_TRANSACTION", "instrument_id", "PAYMENT_INSTRUMENT"),
    ("PAYMENT_TRANSACTION", "gateway_id", "PAYMENT_GATEWAY"),
    ("PAYMENT_TRANSACTION", "response_code", "RESPONSE_CODE"),
    ("MERCHANT_BANK_ACCOUNT", "merchant_id", "MERCHANT"),
    ("SETTLEMENT", "merchant_id", "MERCHANT"),
    ("SETTLEMENT", "merchant_bank_account_id", "MERCHANT_BANK_ACCOUNT"),
    ("REFUND", "payment_txn_id", "PAYMENT_TRANSACTION"),
    ("CHARGEBACK", "payment_txn_id", "PAYMENT_TRANSACTION"),
    ("LEDGER_ENTRY", "payment_txn_id", "PAYMENT_TRANSACTION"),
    ("LEDGER_ENTRY", "settlement_utr", "SETTLEMENT"),
    ("LEDGER_ENTRY", "refund_id", "REFUND"),
    ("LEDGER_ENTRY", "chargeback_id", "CHARGEBACK"),
    ("MERCHANT_PAYMENT_MODE", "merchant_id", "MERCHANT"),
    ("MERCHANT_SNAPSHOT", "merchant_id", "MERCHANT"),
    ("GATEWAY_SNAPSHOT", "gateway_id", "PAYMENT_GATEWAY"),
]
