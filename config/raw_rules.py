"""Validation rules for the 3 raw files.
To add a rule: add one line  "message shown in quarantine": rule_builder(...)
"""
from utils.checks import positive, at_least, between, one_of, matches, not_more_than

RAW_TABLES = {
    "PAYMENT_TRANSACTION_RAW": {
        "pk": "payment_txn_id",
        "latest_by": "ingestion_timestamp",   # if a PK repeats, keep the newest copy
        "required": ["payment_txn_id", "merchant_id", "txn_amount", "txn_currency", "txn_timestamp"],
        "rules": {
            "txn_amount must be > 0": positive("txn_amount"),
            "mdr_amount cannot be negative": at_least("mdr_amount", 0),
            "net_settlement_amount bigger than txn_amount": not_more_than("net_settlement_amount", "txn_amount"),
            "txn_currency must be 3 letters": matches("txn_currency", r"[A-Z]{3}"),
            # edit this list to match the statuses in your data
            "unknown txn_status": one_of("txn_status", ["INITIATED", "PENDING", "SUCCESS", "FAILED",
                                                         "REFUNDED", "CANCELLED", "TIMEOUT", "DROPPED"]),
        },
    },
    "SETTLEMENT_LEDGER_RAW": {
        "pk": "ledger_entry_id",
        "latest_by": "ingestion_timestamp",
        "required": ["ledger_entry_id", "merchant_id", "entry_type", "currency", "ledger_timestamp"],
        "rules": {
            "gross_amount cannot be negative": at_least("gross_amount", 0),
            "refund_amount bigger than gross_amount": not_more_than("refund_amount", "gross_amount"),
            "entry_direction must be CREDIT or DEBIT": one_of("entry_direction", ["CREDIT", "DEBIT"]),
        },
    },
    "MERCHANT_GATEWAY_SNAPSHOT_RAW": {
        "pk": "snapshot_id",
        "latest_by": "ingestion_timestamp",
        "required": ["snapshot_id", "snapshot_timestamp"],
        "rules": {
            "success_rate_percent not 0-100": between("success_rate_percent", 0, 100),
            "gateway success_rate not 0-100": between("success_rate_percent.1", 0, 100),
            "successful_txn_count bigger than total": not_more_than("successful_txn_count", "total_txn_count"),
            "effective_to before effective_from": not_more_than("effective_from", "effective_to"),
        },
    },
}
