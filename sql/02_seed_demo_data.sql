-- Deterministic synthetic portfolio generator
-- Produces exactly 600 applications, 384 approvals and 312 disbursals.

USE lendguard_demo;

SET @reporting_date = DATE('2026-07-31');

INSERT INTO lender_partners
  (partner_id, partner_name, partner_type, risk_share_pct, target_apr_pct)
VALUES
  (1, 'Aurora Bank', 'BANK', 40.00, 18.50),
  (2, 'Nimbus Finance', 'NBFC', 55.00, 22.00),
  (3, 'Pinnacle Credit', 'FINTECH', 65.00, 24.00),
  (4, 'Summit Capital', 'NBFC', 50.00, 20.50),
  (5, 'Trustline Bank', 'BANK', 35.00, 17.50);

INSERT INTO customers
  (customer_id, synthetic_customer_ref, age, employment_type, monthly_income, city_tier, created_at)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 600
)
SELECT
  n,
  CONCAT('CUS-', LPAD(n, 6, '0')),
  21 + MOD(n * 17, 39),
  ELT(1 + MOD(n, 4), 'SALARIED', 'SELF_EMPLOYED', 'GIG', 'OTHER'),
  22000 + MOD(n * 7919, 158000),
  ELT(1 + MOD(n * 3, 3), 'TIER_1', 'TIER_2', 'TIER_3'),
  TIMESTAMP(DATE_SUB(@reporting_date, INTERVAL (480 + MOD(n, 900)) DAY), '10:00:00')
FROM seq;

INSERT INTO loan_applications
  (application_id, customer_id, partner_id, application_date, requested_amount,
   requested_tenure_months, product_code, channel_code, bureau_processed_at,
   decision_status, decision_date, rejection_reason, disbursal_flag, disbursal_date)
WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 600
)
SELECT
  n,
  n,
  1 + MOD(n - 1, 5),
  DATE_SUB(@reporting_date, INTERVAL (60 + MOD(n * 13, 450)) DAY),
  45000 + MOD(n * 15401, 455000),
  ELT(1 + MOD(n, 4), 6, 9, 12, 18),
  ELT(1 + MOD(n, 3), 'PERSONAL_LOAN', 'LINE_OF_CREDIT', 'CONSUMER_LOAN'),
  ELT(1 + MOD(n * 7, 3), 'DIRECT', 'PARTNER', 'MARKETPLACE'),
  CASE WHEN MOD(n - 1, 25) < 23
    THEN TIMESTAMP(DATE_SUB(@reporting_date, INTERVAL (60 + MOD(n * 13, 450)) DAY), '11:30:00')
    ELSE NULL END,
  CASE WHEN MOD(n - 1, 25) < 16 THEN 'APPROVED' ELSE 'REJECTED' END,
  DATE_ADD(DATE_SUB(@reporting_date, INTERVAL (60 + MOD(n * 13, 450)) DAY), INTERVAL (1 + MOD(n, 3)) DAY),
  CASE WHEN MOD(n - 1, 25) < 16 THEN NULL
    ELSE ELT(1 + MOD(n, 4), 'AFFORDABILITY', 'BUREAU_POLICY', 'VERIFICATION', 'FRAUD_CONTROL') END,
  MOD(n - 1, 25) < 13,
  CASE WHEN MOD(n - 1, 25) < 13
    THEN DATE_ADD(DATE_SUB(@reporting_date, INTERVAL (60 + MOD(n * 13, 450)) DAY), INTERVAL (3 + MOD(n, 4)) DAY)
    ELSE NULL END
FROM seq;

-- Three synthetic bureau tradelines per application, all observed before the decision.
INSERT INTO bureau_tradelines
  (tradeline_id, customer_id, application_id, bureau_report_date, account_type,
   opened_date, credit_limit, current_balance, overdue_amount, maximum_dpd,
   writeoff_flag, secured_flag)
WITH RECURSIVE app_seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM app_seq WHERE n < 600
), line_seq AS (
  SELECT 1 AS line_no
  UNION ALL
  SELECT line_no + 1 FROM line_seq WHERE line_no < 3
)
SELECT
  (a.n * 10) + l.line_no,
  a.n,
  a.n,
  DATE_SUB(la.application_date, INTERVAL 1 DAY),
  ELT(1 + MOD(a.n + l.line_no, 5), 'CREDIT_CARD', 'PERSONAL_LOAN', 'AUTO_LOAN', 'HOME_LOAN', 'OTHER'),
  DATE_SUB(la.application_date, INTERVAL (180 + MOD(a.n * l.line_no * 47, 1700)) DAY),
  CASE WHEN MOD(a.n + l.line_no, 5) = 0 THEN 0 ELSE 30000 + MOD(a.n * l.line_no * 919, 270000) END,
  4000 + MOD(a.n * l.line_no * 1231, 185000),
  CASE WHEN MOD(a.n * l.line_no, 7) = 0 THEN 1000 + MOD(a.n * 137, 28000) ELSE 0 END,
  CASE
    WHEN MOD(a.n * l.line_no, 19) = 0 THEN 120
    WHEN MOD(a.n * l.line_no, 11) = 0 THEN 60
    WHEN MOD(a.n * l.line_no, 7) = 0 THEN 30
    ELSE 0
  END,
  MOD(a.n * l.line_no, 97) = 0,
  MOD(a.n + l.line_no, 4) = 0
FROM app_seq a
CROSS JOIN line_seq l
JOIN loan_applications la ON la.application_id = a.n;

-- Zero to five synthetic enquiries in the 90 days before each bureau report.
INSERT INTO bureau_enquiries
  (enquiry_id, customer_id, application_id, bureau_report_date, enquiry_date, enquiry_purpose)
WITH RECURSIVE app_seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM app_seq WHERE n < 600
), enquiry_seq AS (
  SELECT 1 AS enquiry_no
  UNION ALL
  SELECT enquiry_no + 1 FROM enquiry_seq WHERE enquiry_no < 5
)
SELECT
  (a.n * 10) + e.enquiry_no,
  a.n,
  a.n,
  DATE_SUB(la.application_date, INTERVAL 1 DAY),
  DATE_SUB(la.application_date, INTERVAL (2 + MOD(a.n * e.enquiry_no * 11, 88)) DAY),
  ELT(1 + MOD(a.n + e.enquiry_no, 5), 'PERSONAL_LOAN', 'CREDIT_CARD', 'AUTO_LOAN', 'HOME_LOAN', 'OTHER')
FROM app_seq a
CROSS JOIN enquiry_seq e
JOIN loan_applications la ON la.application_id = a.n
WHERE e.enquiry_no <= MOD(a.n * 7, 6);

INSERT INTO loan_accounts
  (account_id, synthetic_account_ref, application_id, customer_id, partner_id,
   disbursal_date, funded_principal, annual_interest_rate_pct, tenure_months,
   scheduled_instalment, account_status)
SELECT
  application_id,
  CONCAT('LN-', LPAD(application_id, 7, '0')),
  application_id,
  customer_id,
  partner_id,
  disbursal_date,
  ROUND(requested_amount * (0.78 + MOD(application_id, 13) / 100), 2),
  16.00 + MOD(application_id * 7, 1400) / 100,
  requested_tenure_months,
  ROUND((requested_amount * (0.78 + MOD(application_id, 13) / 100)) / requested_tenure_months * 1.10, 2),
  'ACTIVE'
FROM loan_applications
WHERE disbursal_flag = TRUE;

-- One contractual snapshot per matured month, plus the next not-due instalment.
INSERT INTO monthly_repayments
  (repayment_id, account_id, instalment_number, due_date, scheduled_amount,
   paid_amount, last_payment_date, days_past_due, outstanding_principal,
   repayment_status, reporting_month_end)
WITH RECURSIVE mob AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM mob WHERE n <= 18
)
SELECT
  (la.account_id * 1000) + (mob.n * 20) + MOD(PERIOD_DIFF(DATE_FORMAT(@reporting_date, '%Y%m'), DATE_FORMAT(la.disbursal_date, '%Y%m')), 20),
  la.account_id,
  mob.n,
  LAST_DAY(DATE_ADD(la.disbursal_date, INTERVAL mob.n MONTH)),
  la.scheduled_instalment,
  CASE
    WHEN MOD(la.account_id * mob.n, 17) IN (0,1,2) THEN 0
    WHEN MOD(la.account_id * mob.n, 11) = 0 THEN ROUND(la.scheduled_instalment * 0.55, 2)
    ELSE la.scheduled_instalment
  END,
  CASE
    WHEN MOD(la.account_id * mob.n, 17) IN (0,1,2) THEN NULL
    ELSE DATE_ADD(LAST_DAY(DATE_ADD(la.disbursal_date, INTERVAL mob.n MONTH)), INTERVAL MOD(la.account_id, 8) DAY)
  END,
  CASE
    WHEN MOD(la.account_id * mob.n, 29) = 0 THEN 120
    WHEN MOD(la.account_id * mob.n, 17) IN (0,1) THEN 95
    WHEN MOD(la.account_id * mob.n, 13) = 0 THEN 60
    WHEN MOD(la.account_id * mob.n, 11) = 0 THEN 35
    WHEN MOD(la.account_id * mob.n, 7) = 0 THEN 12
    ELSE 0
  END,
  GREATEST(0, ROUND(la.funded_principal * (1 - (mob.n - 1) / la.tenure_months), 2)),
  CASE
    WHEN LAST_DAY(DATE_ADD(la.disbursal_date, INTERVAL mob.n MONTH)) > @reporting_date THEN 'NOT_DUE'
    WHEN MOD(la.account_id * mob.n, 17) IN (0,1,2) THEN 'MISSED'
    WHEN MOD(la.account_id * mob.n, 11) = 0 THEN 'PARTIAL'
    ELSE 'PAID'
  END,
  LEAST(@reporting_date, LAST_DAY(DATE_ADD(la.disbursal_date, INTERVAL mob.n MONTH)))
FROM loan_accounts la
CROSS JOIN mob
WHERE mob.n <= LEAST(la.tenure_months, TIMESTAMPDIFF(MONTH, la.disbursal_date, @reporting_date) + 1);

INSERT INTO monthly_repayments
  (repayment_id, account_id, instalment_number, due_date, scheduled_amount,
   paid_amount, last_payment_date, days_past_due, outstanding_principal,
   repayment_status, reporting_month_end)
SELECT
  (account_id * 1000) + 999,
  account_id,
  LEAST(tenure_months, TIMESTAMPDIFF(MONTH, disbursal_date, @reporting_date) + 2),
  LAST_DAY(DATE_ADD(disbursal_date, INTERVAL (TIMESTAMPDIFF(MONTH, disbursal_date, @reporting_date) + 2) MONTH)),
  scheduled_instalment,
  0,
  NULL,
  0,
  GREATEST(0, ROUND(funded_principal * 0.45, 2)),
  'NOT_DUE',
  @reporting_date
FROM loan_accounts
WHERE TIMESTAMPDIFF(MONTH, disbursal_date, @reporting_date) + 2 <= tenure_months;

SELECT
  COUNT(*) AS applications,
  SUM(decision_status = 'APPROVED') AS approvals,
  SUM(disbursal_flag = TRUE) AS disbursals
FROM loan_applications;
