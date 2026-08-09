# Methodology

## Reporting boundary

- Reporting date: 31 July 2026
- Data: deterministic synthetic portfolio
- Currency: INR
- Customer population: 600
- Database: MySQL 8.0
- Public experience: React and Vite

## Analytical grains

| Layer | Grain | Purpose |
| --- | --- | --- |
| Customer bureau features | Customer and application snapshot | Point-in-time risk segmentation |
| Application funnel | Application | Conversion, leakage and cycle time |
| Partner risk | Lender partner | Conversion, FPD and exposure-weighted PAR |
| Current portfolio | Funded account | Current DPD and outstanding exposure |
| Vintage | Origination month and MOB | Comparable cohort deterioration |
| Roll rate | Month and bucket transition | Cure, stability and forward migration |
| Early warning | Funded account | Interpretable treatment queue |

## Metric definitions

**Approval rate** = approved submitted applications / submitted applications.

**Approval-to-disbursal** = disbursed applications / approved applications.

**Account 30+/60+/90+** = reporting accounts at or beyond the threshold / reporting accounts.

**PAR 30/60/90** = outstanding principal at or beyond the threshold / total reporting outstanding.

**FPD** = loans whose first matured instalment reached 30+ DPD / loans with a matured first instalment.

**Vintage curve** = PAR or delinquency measure by origination month and month on book.

**Roll rate** = accounts moving from starting bucket A to ending bucket B / accounts starting in bucket A.

## Early-warning rules

The demonstration warning score combines current DPD, first-payment default, repeat payment shortfalls, worsening DPD, high bureau utilisation and enquiry intensity. The score is deliberately interpretable and supports prioritisation only.

| Segment | Illustrative operating response |
| --- | --- |
| Critical | Late-stage collections and restructuring assessment |
| High | Priority outreach, hardship or payment-date review and pause new exposure |
| Watch | Reminder, bureau refresh where appropriate and increased monitoring |
| Stable | Standard monitoring cadence |

## Maturity and leakage controls

- Bureau observations are bounded to the report immediately before the application decision.
- Future `NOT_DUE` instalments are excluded from matured performance denominators.
- FPD includes only loans with a matured first due date.
- Views remain separate by analytical grain instead of being physically joined into one fan-out dataset.
- Counts, funded principal and outstanding exposure are reconciled before publication.

## Responsible-use boundary

This project does not estimate expected credit loss, profitability, fraud probability or causal partner performance. The alert rules are examples, not validated predictive models. Production use would require consent and permissible-use controls, least-privilege access, temporal validation, fairness and drift testing, outcome monitoring, reason codes and recorded human overrides.
