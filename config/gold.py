"""Gold tables (study guide section 16) = pre-aggregated SQL on the star schema.

Rules used in every query:
  * rates are recomputed from summed counts (successes / attempts), never averaged
  * money comes from the LEDGER (PAYMENT entries), not from payment attempts:
    a failed attempt earns no MDR, and AUTHORIZATION entries move no money
  * money is rounded to 2 decimals as DECIMAL (no float noise in reports)
"""
from utils.delta_store import sql_ref


def dw(name):
    return sql_ref("datawarehouse", name)

MONEY = "ROUND(CAST(SUM({col}) AS DECIMAL(28,6)), 2)"
RATE = "ROUND(CAST(100.0 * {part} / NULLIF({whole}, 0) AS DECIMAL(28,6)), 2)"

GOLD = {
    # 1 row = 1 merchant x 1 day
    "gold_daily_merchant_performance": {
        "pk": ["date_key", "merchant_key"],
        "sql": f"""
        WITH pay AS (
            SELECT date_key, merchant_key,
                   SUM(attempt_count) AS attempts, SUM(success_count) AS successes,
                   SUM(txn_amount * success_count) AS gmv              -- successful sales only
            FROM {dw('fact_payment_txn')} GROUP BY 1, 2),
        ref AS (
            SELECT initiated_date_key AS date_key, merchant_key, SUM(refund_amount) AS refund_amount
            FROM {dw('fact_refund')} GROUP BY 1, 2),
        cb AS (
            SELECT received_date_key AS date_key, merchant_key, SUM(case_count) AS chargeback_count
            FROM {dw('fact_chargeback')} GROUP BY 1, 2)
        SELECT date_key, merchant_key, m.merchant_id, m.merchant_name,
               COALESCE(attempts, 0) AS attempts, COALESCE(successes, 0) AS successes,
               {RATE.format(part="successes", whole="attempts")} AS success_rate_pct,
               COALESCE(gmv, 0) AS gmv,
               ROUND(CAST(gmv AS DECIMAL(28,6)) / NULLIF(successes, 0), 2) AS avg_ticket_size,
               ROUND(CAST(COALESCE(refund_amount, 0) AS DECIMAL(28,6)), 2) AS refund_amount,
               COALESCE(chargeback_count, 0) AS chargeback_count
        FROM pay
        FULL JOIN ref USING (date_key, merchant_key)
        FULL JOIN cb  USING (date_key, merchant_key)
        LEFT JOIN {dw('dim_merchant')} m USING (merchant_key)"""},

    # 1 row = 1 day x payment mode x gateway x issuer bank
    "gold_daily_payment_mode_success": {
        "pk": ["date_key", "payment_mode_key", "gateway_key", "issuer_bank_key"],
        "sql": f"""
        SELECT f.date_key, f.payment_mode_key, f.gateway_key, f.issuer_bank_key,
               pm.payment_mode, g.gateway_name, b.bank_name AS issuer_bank_name,
               SUM(f.attempt_count) AS attempts, SUM(f.success_count) AS successes,
               {RATE.format(part="SUM(f.success_count)", whole="SUM(f.attempt_count)")} AS success_rate_pct,
               ROUND(AVG(f.bank_response_time_ms), 1) AS avg_response_time_ms,
               {RATE.format(part="SUM(CASE WHEN fl.is_timeout THEN 1 ELSE 0 END)",
                            whole="SUM(f.attempt_count)")} AS timeout_rate_pct
        FROM {dw('fact_payment_txn')} f
        JOIN {dw('dim_payment_mode')} pm USING (payment_mode_key)
        JOIN {dw('dim_gateway')} g       USING (gateway_key)
        JOIN {dw('dim_bank')} b          ON b.bank_key = f.issuer_bank_key
        JOIN {dw('dim_txn_flags')} fl    USING (txn_flags_key)
        GROUP BY 1, 2, 3, 4, 5, 6, 7"""},

    # 1 row = 1 merchant x 1 day
    "gold_daily_merchant_settlement": {
        "pk": ["date_key", "merchant_key"],
        "sql": f"""
        WITH led AS (
            SELECT f.date_key, f.merchant_key,
                   {MONEY.format(col="f.gross_amount")} AS gross_amount,
                   {MONEY.format(col="f.mdr_amount")} AS mdr_amount,
                   {MONEY.format(col="f.gst_on_mdr")} AS gst_on_mdr,
                   {MONEY.format(col="f.refund_amount")} AS refunds,
                   {MONEY.format(col="f.chargeback_amount")} AS chargebacks,
                   {MONEY.format(col="f.net_settlement_amount")} AS net_amount
            FROM {dw('fact_ledger_entry')} f
            JOIN {dw('dim_entry_type')} e USING (entry_type_key)
            WHERE e.entry_type = 'PAYMENT'
            GROUP BY 1, 2),
        st AS (
            SELECT date_key, merchant_key,
                   {MONEY.format(col="settlement_amount")} AS net_settled,
                   {MONEY.format(col="hold_amount")} AS amount_on_hold,
                   COUNT(*) AS payouts
            FROM {dw('fact_settlement')} GROUP BY 1, 2)
        SELECT date_key, merchant_key, m.merchant_id,
               COALESCE(gross_amount, 0) AS gross_amount, COALESCE(mdr_amount, 0) AS mdr_amount,
               COALESCE(gst_on_mdr, 0) AS gst_on_mdr, COALESCE(refunds, 0) AS refunds,
               COALESCE(chargebacks, 0) AS chargebacks, COALESCE(net_amount, 0) AS net_amount,
               COALESCE(net_settled, 0) AS net_settled, COALESCE(amount_on_hold, 0) AS amount_on_hold,
               COALESCE(payouts, 0) AS payouts
        FROM led
        FULL JOIN st USING (date_key, merchant_key)
        LEFT JOIN {dw('dim_merchant')} m USING (merchant_key)"""},

    # 1 row = 1 day x payment mode x merchant      (GST is tax, not revenue)
    "gold_daily_platform_revenue": {
        "pk": ["date_key", "payment_mode_key", "merchant_key"],
        "sql": f"""
        SELECT f.date_key, f.payment_mode_key, f.merchant_key, pm.payment_mode, m.merchant_id,
               {MONEY.format(col="f.mdr_amount")} AS mdr_revenue,
               {MONEY.format(col="COALESCE(f.convenience_fee, 0) + COALESCE(f.platform_fee, 0) + COALESCE(f.chargeback_fee, 0)")} AS other_fees,
               {MONEY.format(col="COALESCE(f.mdr_amount, 0) + COALESCE(f.convenience_fee, 0) + COALESCE(f.platform_fee, 0) + COALESCE(f.chargeback_fee, 0)")} AS total_revenue
        FROM {dw('fact_ledger_entry')} f
        JOIN {dw('dim_entry_type')} e    USING (entry_type_key)
        JOIN {dw('dim_payment_mode')} pm USING (payment_mode_key)
        JOIN {dw('dim_merchant')} m      USING (merchant_key)
        WHERE e.entry_type = 'PAYMENT'
        GROUP BY 1, 2, 3, 4, 5"""},
}