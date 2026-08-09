-- Publication gates. Every failed_rows value should equal zero.

USE lendguard_demo;

SELECT 'application_orphan_customer' AS check_name, COUNT(*) AS failed_rows
FROM loan_applications la LEFT JOIN customers c ON c.customer_id = la.customer_id
WHERE c.customer_id IS NULL
UNION ALL
SELECT 'application_orphan_partner', COUNT(*)
FROM loan_applications la LEFT JOIN lender_partners lp ON lp.partner_id = la.partner_id
WHERE lp.partner_id IS NULL
UNION ALL
SELECT 'account_without_disbursed_application', COUNT(*)
FROM loan_accounts a JOIN loan_applications la ON la.application_id = a.application_id
WHERE la.disbursal_flag = FALSE OR la.disbursal_date IS NULL
UNION ALL
SELECT 'repayment_orphan_account', COUNT(*)
FROM monthly_repayments mr LEFT JOIN loan_accounts a ON a.account_id = mr.account_id
WHERE a.account_id IS NULL
UNION ALL
SELECT 'decision_before_application', COUNT(*)
FROM loan_applications
WHERE decision_date < application_date
UNION ALL
SELECT 'disbursal_before_approval', COUNT(*)
FROM loan_applications
WHERE disbursal_date < decision_date
UNION ALL
SELECT 'bureau_report_after_application', COUNT(*)
FROM bureau_tradelines bt JOIN loan_applications la ON la.application_id = bt.application_id
WHERE bt.bureau_report_date >= la.application_date
UNION ALL
SELECT 'enquiry_after_bureau_report', COUNT(*)
FROM bureau_enquiries
WHERE enquiry_date > bureau_report_date
UNION ALL
SELECT 'future_record_not_marked_not_due', COUNT(*)
FROM monthly_repayments
WHERE due_date > DATE('2026-07-31') AND repayment_status <> 'NOT_DUE'
UNION ALL
SELECT 'not_due_record_with_payment', COUNT(*)
FROM monthly_repayments
WHERE repayment_status = 'NOT_DUE' AND (paid_amount <> 0 OR days_past_due <> 0)
UNION ALL
SELECT 'negative_financial_value', COUNT(*)
FROM monthly_repayments
WHERE scheduled_amount < 0 OR paid_amount < 0 OR outstanding_principal < 0
UNION ALL
SELECT 'fpd_numerator_exceeds_denominator', CASE WHEN SUM(fpd_flag) > COUNT(*) THEN 1 ELSE 0 END
FROM vw_fpd
UNION ALL
SELECT 'par_threshold_hierarchy', COUNT(*)
FROM vw_portfolio_kpis
WHERE par_30_pct < par_90_pct
UNION ALL
SELECT 'account_threshold_hierarchy', COUNT(*)
FROM vw_portfolio_kpis
WHERE account_30_pct < account_60_pct OR account_60_pct < account_90_pct;

-- Funnel reconciliation
SELECT
  COUNT(*) AS applications,
  SUM(decision_status = 'APPROVED') AS approvals,
  SUM(disbursal_flag = TRUE) AS disbursals,
  (SELECT COUNT(*) FROM loan_accounts) AS funded_accounts,
  SUM(disbursal_flag = TRUE) - (SELECT COUNT(*) FROM loan_accounts) AS disbursal_account_difference
FROM loan_applications;

-- Principal and current outstanding reconciliation
SELECT
  ROUND(SUM(funded_principal), 2) AS funded_principal,
  ROUND((SELECT SUM(outstanding_principal) FROM vw_current_account_snapshot), 2) AS current_outstanding,
  COUNT(*) AS funded_accounts,
  (SELECT COUNT(*) FROM vw_current_account_snapshot) AS reporting_accounts
FROM loan_accounts;

-- Expected demonstration population
SELECT
  CASE WHEN applications = 600 THEN 'PASS' ELSE 'FAIL' END AS application_count_check,
  CASE WHEN approvals = 384 THEN 'PASS' ELSE 'FAIL' END AS approval_count_check,
  CASE WHEN disbursals = 312 THEN 'PASS' ELSE 'FAIL' END AS disbursal_count_check
FROM vw_portfolio_kpis;
