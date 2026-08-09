-- Governed analytical layer for Tableau or another BI consumer.
-- Keep views separate by analytical grain.

USE lendguard_demo;

CREATE OR REPLACE VIEW vw_customer_bureau_features AS
WITH tradeline_features AS (
  SELECT
    application_id,
    SUM(current_balance) AS bureau_balance,
    SUM(credit_limit) AS bureau_limit,
    SUM(overdue_amount) AS bureau_overdue,
    MAX(maximum_dpd) AS prior_max_dpd,
    MAX(writeoff_flag) AS prior_writeoff_flag
  FROM bureau_tradelines
  GROUP BY application_id
), enquiry_features AS (
  SELECT
    be.application_id,
    COUNT(*) AS enquiries_90d
  FROM bureau_enquiries be
  JOIN loan_applications la ON la.application_id = be.application_id
  WHERE be.enquiry_date BETWEEN DATE_SUB(la.application_date, INTERVAL 90 DAY) AND la.application_date
    AND be.enquiry_date <= be.bureau_report_date
  GROUP BY be.application_id
)
SELECT
  la.application_id,
  la.customer_id,
  la.partner_id,
  la.application_date,
  COALESCE(tf.bureau_balance, 0) AS bureau_balance,
  COALESCE(tf.bureau_limit, 0) AS bureau_limit,
  COALESCE(tf.bureau_overdue, 0) AS bureau_overdue,
  COALESCE(tf.prior_max_dpd, 0) AS prior_max_dpd,
  COALESCE(tf.prior_writeoff_flag, 0) AS prior_writeoff_flag,
  ROUND(100 * COALESCE(tf.bureau_balance, 0) / NULLIF(tf.bureau_limit, 0), 1) AS utilisation_pct,
  ROUND(COALESCE(tf.bureau_balance, 0) / NULLIF(c.monthly_income * 12, 0), 2) AS balance_to_annual_income,
  COALESCE(ef.enquiries_90d, 0) AS enquiries_90d,
  CASE
    WHEN tf.prior_writeoff_flag = 1 OR tf.prior_max_dpd >= 90 THEN 'VERY_HIGH'
    WHEN tf.prior_max_dpd >= 30 OR 100 * tf.bureau_balance / NULLIF(tf.bureau_limit, 0) >= 80 THEN 'HIGH'
    WHEN 100 * tf.bureau_balance / NULLIF(tf.bureau_limit, 0) >= 50
      OR COALESCE(ef.enquiries_90d, 0) >= 3 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS bureau_risk_band
FROM loan_applications la
JOIN customers c ON c.customer_id = la.customer_id
LEFT JOIN tradeline_features tf ON tf.application_id = la.application_id
LEFT JOIN enquiry_features ef ON ef.application_id = la.application_id;

CREATE OR REPLACE VIEW vw_application_funnel AS
SELECT
  partner_id,
  COUNT(*) AS submitted_applications,
  SUM(bureau_processed_at IS NOT NULL) AS bureau_processed_applications,
  SUM(decision_status = 'APPROVED') AS approved_applications,
  SUM(decision_status = 'REJECTED') AS rejected_applications,
  SUM(disbursal_flag = TRUE) AS disbursed_applications,
  ROUND(100 * SUM(decision_status = 'APPROVED') / NULLIF(COUNT(*), 0), 1) AS approval_rate_pct,
  ROUND(100 * SUM(disbursal_flag = TRUE) / NULLIF(SUM(decision_status = 'APPROVED'), 0), 1) AS approval_to_disbursal_pct,
  ROUND(AVG(CASE WHEN decision_date IS NOT NULL THEN DATEDIFF(decision_date, application_date) END), 1) AS avg_decision_days,
  ROUND(AVG(CASE WHEN disbursal_date IS NOT NULL THEN DATEDIFF(disbursal_date, application_date) END), 1) AS avg_disbursal_days
FROM loan_applications
GROUP BY partner_id;

CREATE OR REPLACE VIEW vw_current_account_snapshot AS
WITH ranked AS (
  SELECT
    mr.*,
    ROW_NUMBER() OVER (
      PARTITION BY mr.account_id
      ORDER BY mr.reporting_month_end DESC, mr.due_date DESC, mr.instalment_number DESC
    ) AS row_rank
  FROM monthly_repayments mr
  WHERE mr.repayment_status <> 'NOT_DUE'
    AND mr.reporting_month_end <= DATE('2026-07-31')
)
SELECT
  account_id,
  reporting_month_end,
  due_date,
  days_past_due,
  outstanding_principal,
  CASE
    WHEN days_past_due = 0 THEN 'CURRENT'
    WHEN days_past_due < 30 THEN '1-29'
    WHEN days_past_due < 60 THEN '30-59'
    WHEN days_past_due < 90 THEN '60-89'
    ELSE '90+'
  END AS dpd_bucket
FROM ranked
WHERE row_rank = 1;

CREATE OR REPLACE VIEW vw_fpd AS
WITH first_due AS (
  SELECT
    account_id,
    MIN(due_date) AS first_due_date
  FROM monthly_repayments
  WHERE repayment_status <> 'NOT_DUE'
  GROUP BY account_id
), first_performance AS (
  SELECT
    fd.account_id,
    fd.first_due_date,
    MAX(mr.days_past_due) AS first_payment_max_dpd
  FROM first_due fd
  JOIN monthly_repayments mr
    ON mr.account_id = fd.account_id
    AND mr.due_date = fd.first_due_date
  WHERE fd.first_due_date <= DATE_SUB(DATE('2026-07-31'), INTERVAL 30 DAY)
  GROUP BY fd.account_id, fd.first_due_date
)
SELECT
  la.account_id,
  la.partner_id,
  fp.first_due_date,
  fp.first_payment_max_dpd,
  fp.first_payment_max_dpd >= 30 AS fpd_flag
FROM first_performance fp
JOIN loan_accounts la ON la.account_id = fp.account_id;

CREATE OR REPLACE VIEW vw_partner_risk AS
SELECT
  lp.partner_id,
  lp.partner_name,
  af.submitted_applications,
  af.approved_applications,
  af.disbursed_applications,
  af.approval_rate_pct,
  af.approval_to_disbursal_pct,
  ROUND(100 * AVG(COALESCE(f.fpd_flag, 0)), 1) AS fpd_rate_pct,
  ROUND(100 * SUM(CASE WHEN cas.days_past_due >= 30 THEN cas.outstanding_principal ELSE 0 END)
    / NULLIF(SUM(cas.outstanding_principal), 0), 1) AS par_30_pct,
  ROUND(100 * SUM(CASE WHEN cas.days_past_due >= 90 THEN cas.outstanding_principal ELSE 0 END)
    / NULLIF(SUM(cas.outstanding_principal), 0), 1) AS par_90_pct,
  ROUND(SUM(cas.outstanding_principal), 2) AS outstanding_exposure
FROM lender_partners lp
JOIN vw_application_funnel af ON af.partner_id = lp.partner_id
LEFT JOIN loan_accounts la ON la.partner_id = lp.partner_id
LEFT JOIN vw_current_account_snapshot cas ON cas.account_id = la.account_id
LEFT JOIN vw_fpd f ON f.account_id = la.account_id
GROUP BY lp.partner_id, lp.partner_name, af.submitted_applications,
  af.approved_applications, af.disbursed_applications, af.approval_rate_pct,
  af.approval_to_disbursal_pct;

CREATE OR REPLACE VIEW vw_current_portfolio AS
SELECT
  la.account_id,
  la.synthetic_account_ref,
  la.customer_id,
  la.partner_id,
  lp.partner_name,
  la.disbursal_date,
  la.funded_principal,
  cas.reporting_month_end,
  cas.days_past_due,
  cas.dpd_bucket,
  cas.outstanding_principal,
  cas.days_past_due >= 30 AS account_30_flag,
  cas.days_past_due >= 60 AS account_60_flag,
  cas.days_past_due >= 90 AS account_90_flag
FROM loan_accounts la
JOIN lender_partners lp ON lp.partner_id = la.partner_id
JOIN vw_current_account_snapshot cas ON cas.account_id = la.account_id;

CREATE OR REPLACE VIEW vw_delinquency_trend AS
SELECT
  mr.reporting_month_end,
  COUNT(DISTINCT mr.account_id) AS matured_accounts,
  ROUND(100 * COUNT(DISTINCT CASE WHEN mr.days_past_due >= 30 THEN mr.account_id END)
    / NULLIF(COUNT(DISTINCT mr.account_id), 0), 1) AS account_30_pct,
  ROUND(100 * COUNT(DISTINCT CASE WHEN mr.days_past_due >= 60 THEN mr.account_id END)
    / NULLIF(COUNT(DISTINCT mr.account_id), 0), 1) AS account_60_pct,
  ROUND(100 * COUNT(DISTINCT CASE WHEN mr.days_past_due >= 90 THEN mr.account_id END)
    / NULLIF(COUNT(DISTINCT mr.account_id), 0), 1) AS account_90_pct
FROM monthly_repayments mr
WHERE mr.repayment_status <> 'NOT_DUE'
GROUP BY mr.reporting_month_end;

CREATE OR REPLACE VIEW vw_vintage_par30 AS
SELECT
  DATE_FORMAT(la.disbursal_date, '%Y-%m-01') AS origination_month,
  TIMESTAMPDIFF(MONTH, DATE_FORMAT(la.disbursal_date, '%Y-%m-01'), mr.reporting_month_end) AS month_on_book,
  COUNT(DISTINCT la.account_id) AS accounts,
  ROUND(100 * SUM(CASE WHEN mr.days_past_due >= 30 THEN mr.outstanding_principal ELSE 0 END)
    / NULLIF(SUM(mr.outstanding_principal), 0), 1) AS par_30_pct
FROM loan_accounts la
JOIN monthly_repayments mr ON mr.account_id = la.account_id
WHERE mr.repayment_status <> 'NOT_DUE'
GROUP BY DATE_FORMAT(la.disbursal_date, '%Y-%m-01'),
  TIMESTAMPDIFF(MONTH, DATE_FORMAT(la.disbursal_date, '%Y-%m-01'), mr.reporting_month_end);

CREATE OR REPLACE VIEW vw_roll_rate AS
WITH bucketed AS (
  SELECT
    account_id,
    reporting_month_end,
    CASE
      WHEN days_past_due = 0 THEN 'CURRENT'
      WHEN days_past_due < 30 THEN '1-29'
      WHEN days_past_due < 60 THEN '30-59'
      WHEN days_past_due < 90 THEN '60-89'
      ELSE '90+'
    END AS dpd_bucket,
    LEAD(reporting_month_end) OVER (PARTITION BY account_id ORDER BY reporting_month_end) AS next_month,
    LEAD(CASE
      WHEN days_past_due = 0 THEN 'CURRENT'
      WHEN days_past_due < 30 THEN '1-29'
      WHEN days_past_due < 60 THEN '30-59'
      WHEN days_past_due < 90 THEN '60-89'
      ELSE '90+'
    END) OVER (PARTITION BY account_id ORDER BY reporting_month_end) AS next_bucket
  FROM monthly_repayments
  WHERE repayment_status <> 'NOT_DUE'
)
SELECT
  reporting_month_end,
  dpd_bucket AS starting_bucket,
  next_bucket AS ending_bucket,
  COUNT(*) AS accounts,
  ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY reporting_month_end, dpd_bucket), 1) AS roll_rate_pct
FROM bucketed
WHERE next_bucket IS NOT NULL
  AND PERIOD_DIFF(DATE_FORMAT(next_month, '%Y%m'), DATE_FORMAT(reporting_month_end, '%Y%m')) = 1
GROUP BY reporting_month_end, dpd_bucket, next_bucket;

CREATE OR REPLACE VIEW vw_early_warning AS
WITH recent_shortfalls AS (
  SELECT
    account_id,
    SUM(repayment_status IN ('MISSED','PARTIAL')) AS shortfall_count,
    MAX(days_past_due) AS maximum_dpd
  FROM monthly_repayments
  WHERE repayment_status <> 'NOT_DUE'
    AND reporting_month_end >= DATE_SUB(DATE('2026-07-31'), INTERVAL 4 MONTH)
  GROUP BY account_id
), scored AS (
  SELECT
    cp.account_id,
    cp.synthetic_account_ref,
    cp.partner_id,
    cp.partner_name,
    cp.days_past_due,
    cp.outstanding_principal,
    cbf.utilisation_pct,
    cbf.enquiries_90d,
    COALESCE(f.fpd_flag, 0) AS fpd_flag,
    COALESCE(rs.shortfall_count, 0) AS shortfall_count,
    LEAST(100,
      CASE WHEN cp.days_past_due >= 90 THEN 55 WHEN cp.days_past_due >= 60 THEN 42 WHEN cp.days_past_due >= 30 THEN 28 WHEN cp.days_past_due > 0 THEN 10 ELSE 0 END
      + CASE WHEN COALESCE(f.fpd_flag, 0) = 1 THEN 18 ELSE 0 END
      + LEAST(12, COALESCE(rs.shortfall_count, 0) * 4)
      + CASE WHEN cbf.utilisation_pct >= 80 THEN 8 ELSE 0 END
      + CASE WHEN cbf.enquiries_90d >= 4 THEN 7 ELSE 0 END
    ) AS warning_score
  FROM vw_current_portfolio cp
  JOIN loan_accounts la ON la.account_id = cp.account_id
  JOIN vw_customer_bureau_features cbf ON cbf.application_id = la.application_id
  LEFT JOIN vw_fpd f ON f.account_id = cp.account_id
  LEFT JOIN recent_shortfalls rs ON rs.account_id = cp.account_id
)
SELECT
  *,
  CASE
    WHEN warning_score >= 80 OR days_past_due >= 90 THEN 'CRITICAL'
    WHEN warning_score >= 60 OR days_past_due >= 30 THEN 'HIGH'
    WHEN warning_score >= 35 OR days_past_due > 0 THEN 'WATCH'
    ELSE 'STABLE'
  END AS warning_segment,
  CASE
    WHEN days_past_due >= 90 THEN 'Late-stage collections and restructuring assessment'
    WHEN warning_score >= 80 THEN 'Immediate outreach, affordability review and pause new exposure'
    WHEN days_past_due >= 30 THEN 'Priority collections and payment-date review'
    WHEN warning_score >= 35 THEN 'Reminder, bureau refresh where appropriate and closer monitoring'
    ELSE 'Standard monitoring cadence'
  END AS recommended_action
FROM scored;

CREATE OR REPLACE VIEW vw_alert_summary AS
SELECT
  warning_segment,
  COUNT(*) AS accounts,
  ROUND(SUM(outstanding_principal), 2) AS outstanding_exposure,
  ROUND(AVG(warning_score), 1) AS avg_warning_score
FROM vw_early_warning
GROUP BY warning_segment;

CREATE OR REPLACE VIEW vw_portfolio_kpis AS
SELECT
  (SELECT COUNT(*) FROM loan_applications) AS applications,
  (SELECT SUM(decision_status = 'APPROVED') FROM loan_applications) AS approvals,
  (SELECT COUNT(*) FROM loan_accounts) AS disbursals,
  ROUND(100 * (SELECT SUM(decision_status = 'APPROVED') FROM loan_applications)
    / NULLIF((SELECT COUNT(*) FROM loan_applications), 0), 1) AS approval_rate_pct,
  ROUND(SUM(cp.account_30_flag) * 100 / NULLIF(COUNT(*), 0), 1) AS account_30_pct,
  ROUND(SUM(cp.account_60_flag) * 100 / NULLIF(COUNT(*), 0), 1) AS account_60_pct,
  ROUND(SUM(cp.account_90_flag) * 100 / NULLIF(COUNT(*), 0), 1) AS account_90_pct,
  ROUND(100 * SUM(CASE WHEN cp.days_past_due >= 30 THEN cp.outstanding_principal ELSE 0 END)
    / NULLIF(SUM(cp.outstanding_principal), 0), 1) AS par_30_pct,
  ROUND(100 * SUM(CASE WHEN cp.days_past_due >= 90 THEN cp.outstanding_principal ELSE 0 END)
    / NULLIF(SUM(cp.outstanding_principal), 0), 1) AS par_90_pct,
  ROUND(100 * (SELECT AVG(fpd_flag) FROM vw_fpd), 1) AS fpd_rate_pct,
  ROUND(SUM(cp.outstanding_principal), 2) AS outstanding_exposure
FROM vw_current_portfolio cp;
