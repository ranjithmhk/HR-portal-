"""The 8 fact tables (study guide section 13). Always state the grain first!

  base        main lake table (1 row of it = 1 fact row before de-duplication)
  joins       extra columns from other lake tables, applied in order (a later join
              can use a column from an earlier one):
                {"table": t, "on": col, "columns": [...]}        plain lookup
                {"table": t, "on": col, "agg": {new: (col, func)}} summary per key
  as_of       date used to pick the SCD2 version that was valid at that moment
  dims        (dimension, key name in the fact, {fact column: dimension column})
  dates       (key name, column)  -> 20251222      times: (key name, column) -> 1435
  measures    {name: column}  or  {name: function(df)} for calculated measures
  degenerate  ids kept in the fact (no dimension of their own)
  grain       columns that make one row unique (duplicates: last one wins) = primary key
"""
from config.dimensions import FLAGS

PAYMENT_CONTEXT = [   # payment -> order -> merchant (strict 3NF: the merchant is on the order)
    {"table": "payment_transaction", "on": "payment_txn_id",
     "columns": ["order_id", "payment_mode", "txn_currency", "gateway_id", "instrument_id"]},
    {"table": "payment_order", "on": "order_id", "columns": ["merchant_id"]},
]
IS_SUCCESS = lambda df: (df["txn_status"] == "SUCCESS").astype(int)   # noqa: E731

FACTS = {
    "fact_payment_txn": {                                   # grain: 1 payment attempt
        "base": "payment_transaction", "as_of": "txn_timestamp",
        "joins": [
            {"table": "payment_order", "on": "order_id", "columns": ["merchant_id", "customer_id"]},
            {"table": "checkout_session", "on": "checkout_session_id", "columns": ["device_id"]},
            {"table": "payment_instrument", "on": "instrument_id", "columns": ["issuer_bank_id"]},
            {"table": "payment_gateway", "on": "gateway_id", "columns": ["acquirer_bank_id"]}],
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_customer", "customer_key", {"customer_id": "customer_id"}),
            ("dim_payment_instrument", "instrument_key", {"instrument_id": "instrument_id"}),
            ("dim_bank", "issuer_bank_key", {"issuer_bank_id": "bank_id"}),     # role-playing:
            ("dim_bank", "acquirer_bank_key", {"acquirer_bank_id": "bank_id"}), # same dim twice
            ("dim_gateway", "gateway_key", {"gateway_id": "gateway_id"}),
            ("dim_device", "device_key", {"device_id": "device_id"}),
            ("dim_payment_mode", "payment_mode_key", {"payment_mode": "payment_mode"}),
            ("dim_txn_status", "txn_status_key", {"txn_status": "txn_status"}),
            ("dim_response_code", "response_code_key", {"response_code": "response_code"}),
            ("dim_geography", "geography_key", {"ip_country": "country", "ip_city": "city"}),
            ("dim_currency", "currency_key", {"txn_currency": "currency"}),
            ("dim_txn_flags", "txn_flags_key", {f: f for f in FLAGS})],
        "dates": [("date_key", "txn_timestamp")], "times": [("time_key", "txn_timestamp")],
        "measures": {"txn_amount": "txn_amount", "amount_in_inr": "amount_in_inr",
                     "mdr_amount": "mdr_amount", "gst_on_mdr": "gst_on_mdr",
                     "net_settlement_amount": "net_settlement_amount",
                     "bank_response_time_ms": "bank_response_time_ms",
                     "gateway_latency_ms": "gateway_latency_ms", "risk_score": "risk_score",
                     "attempt_count": lambda df: 1, "success_count": IS_SUCCESS},
        "degenerate": ["payment_txn_id", "order_id"], "grain": ["payment_txn_id"]},

    "fact_checkout_session": {                              # grain: 1 checkout session
        "base": "checkout_session", "as_of": "checkout_start_time",
        "joins": [
            {"table": "payment_order", "on": "order_id", "columns": ["merchant_id", "customer_id"]},
            {"table": "payment_transaction", "on": "checkout_session_id",
             "agg": {"attempts_in_session": ("payment_txn_id", "count"),
                     "is_converted": ("txn_status", lambda s: int((s == "SUCCESS").any()))}}],
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_customer", "customer_key", {"customer_id": "customer_id"}),
            ("dim_device", "device_key", {"device_id": "device_id"})],
        "dates": [("date_key", "checkout_start_time")], "times": [("time_key", "checkout_start_time")],
        "measures": {"checkout_duration_seconds": "checkout_duration_seconds",
                     "attempts_in_session": "attempts_in_session", "is_converted": "is_converted"},
        "degenerate": ["checkout_session_id", "order_id"], "grain": ["checkout_session_id"]},

    "fact_ledger_entry": {                                  # grain: 1 ledger entry
        "base": "ledger_entry", "as_of": "ledger_timestamp", "joins": PAYMENT_CONTEXT,
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_entry_type", "entry_type_key", {"entry_type": "entry_type"}),
            ("dim_currency", "currency_key", {"currency": "currency"}),
            ("dim_payment_mode", "payment_mode_key", {"payment_mode": "payment_mode"}),
            ("dim_gateway", "gateway_key", {"gateway_id": "gateway_id"})],
        "dates": [("date_key", "ledger_timestamp")],
        "measures": {m: m for m in ["gross_amount", "mdr_amount", "gst_on_mdr", "convenience_fee",
                                    "platform_fee", "tds_amount", "refund_amount", "chargeback_amount",
                                    "chargeback_fee", "adjustment_amount", "net_settlement_amount"]},
        "degenerate": ["ledger_entry_id", "payment_txn_id", "settlement_utr"], "grain": ["ledger_entry_id"]},

    "fact_refund": {                                        # grain: 1 refund
        "base": "refund", "as_of": "refund_initiated_date",
        "joins": PAYMENT_CONTEXT + [
            {"table": "ledger_entry", "on": "refund_id", "agg": {"refund_amount": ("refund_amount", "sum")}}],
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_payment_mode", "payment_mode_key", {"payment_mode": "payment_mode"}),
            ("dim_currency", "currency_key", {"txn_currency": "currency"})],
        "dates": [("initiated_date_key", "refund_initiated_date"),
                  ("completed_date_key", "refund_completed_date")],
        "measures": {"refund_amount": "refund_amount", "refund_count": lambda df: 1,
                     "days_to_complete": lambda df: (df["refund_completed_date"] - df["refund_initiated_date"]).dt.days},
        "degenerate": ["refund_id", "payment_txn_id", "refund_status"], "grain": ["refund_id"]},

    "fact_chargeback": {                                    # grain: 1 chargeback case
        "base": "chargeback", "as_of": "chargeback_received_date",
        "joins": PAYMENT_CONTEXT + [
            {"table": "payment_instrument", "on": "instrument_id", "columns": ["issuer_bank_id"]},
            {"table": "ledger_entry", "on": "chargeback_id",
             "agg": {"chargeback_amount": ("chargeback_amount", "sum"), "chargeback_fee": ("chargeback_fee", "sum")}}],
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_payment_mode", "payment_mode_key", {"payment_mode": "payment_mode"}),
            ("dim_bank", "issuer_bank_key", {"issuer_bank_id": "bank_id"}),
            ("dim_currency", "currency_key", {"txn_currency": "currency"})],
        "dates": [("received_date_key", "chargeback_received_date"), ("due_date_key", "response_due_date")],
        "measures": {"chargeback_amount": "chargeback_amount", "chargeback_fee": "chargeback_fee",
                     "case_count": lambda df: 1,
                     "won_flag": lambda df: (df["chargeback_outcome"] == "WON").astype(int)},
        "degenerate": ["chargeback_id", "payment_txn_id", "chargeback_stage"], "grain": ["chargeback_id"]},

    "fact_settlement": {                                    # grain: 1 settlement payout (UTR)
        "base": "settlement", "as_of": "settlement_date",
        "joins": [{"table": "ledger_entry", "on": "settlement_utr",
                   "agg": {"tds_amount": ("tds_amount", "sum"), "ledger_entries": ("ledger_entry_id", "count")}}],
        "dims": [
            ("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"}),
            ("dim_settlement_mode", "settlement_mode_key", {"settlement_mode": "settlement_mode"}),
            ("dim_currency", "currency_key", {"settlement_currency": "currency"})],
        "dates": [("date_key", "settlement_date")],
        "measures": {"settlement_amount": "settlement_amount",
                     "hold_amount": lambda df: df["settlement_amount"].where(df["is_on_hold"] == True, 0),  # noqa: E712
                     "rolling_reserve_amount": "rolling_reserve_amount", "tds_amount": "tds_amount",
                     "ledger_entries": "ledger_entries"},
        "degenerate": ["settlement_utr"], "grain": ["settlement_utr"]},

    "fact_merchant_daily_snapshot": {                       # grain: 1 merchant x 1 day
        "base": "merchant_snapshot", "as_of": "snapshot_timestamp",
        "dims": [("dim_merchant", "merchant_key", {"merchant_id": "merchant_id"})],
        "dates": [("date_key", "snapshot_timestamp")],
        "measures": {m: m for m in ["total_txn_count", "successful_txn_count", "failed_txn_count",
                                    "gross_merchandise_value", "refund_count", "chargeback_count"]},
        "degenerate": ["merchant_id"], "grain": ["merchant_id", "date_key"]},

    "fact_gateway_daily_snapshot": {                        # grain: 1 gateway x payment mode x day
        "base": "gateway_snapshot", "as_of": "snapshot_timestamp",
        "joins": [{"table": "payment_gateway", "on": "gateway_id", "columns": ["acquirer_bank_id"]}],
        "dims": [
            ("dim_gateway", "gateway_key", {"gateway_id": "gateway_id"}),
            ("dim_bank", "acquirer_bank_key", {"acquirer_bank_id": "bank_id"}),
            ("dim_payment_mode", "payment_mode_key", {"payment_mode": "payment_mode"})],
        "dates": [("date_key", "snapshot_timestamp")],
        "measures": {m: m for m in ["attempt_count", "success_count", "avg_response_time_ms",
                                    "p95_latency_ms", "downtime_minutes"]},
        "degenerate": ["gateway_id", "payment_mode"], "grain": ["gateway_id", "payment_mode", "date_key"]},
}