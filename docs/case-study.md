# Digital Lending Bureau Risk and Lender Partnership Case Study

## Executive summary

This project demonstrates how a digital lender can connect bureau, application, partner and repayment data in one governed risk cockpit. The decision system helps executives compare lenders, credit teams inspect the risk mix and collections teams prioritise accounts before delinquency becomes loss.

All results are produced from deterministic synthetic data. They demonstrate the analytical method and do not represent actual lender or customer performance.

## Headline portfolio

| Measure | Demonstration result | Decision implication |
| --- | ---: | --- |
| Applications | 600 | Track the complete submitted population |
| Approvals | 384, or 64.0% | Read conversion beside downstream risk |
| Disbursals | 312, or 81.2% of approvals | Identify leakage between decision and funding |
| PAR 30 | 62.3% | Prioritise exposure, not only account counts |
| First-payment default | 23.1% | Separate first-cycle intervention from later-stage collections |
| Alert queue | 41 critical, 59 high, 12 watch | Match severity to treatment capacity |

## Business problem

Digital lending can look healthy at origination while deteriorating after disbursal. Application conversion, bureau quality, partner economics and repayment outcomes are often managed in separate systems. That fragmentation makes productive growth difficult to distinguish from risk-heavy growth and delays action when accounts begin to roll forward.

The objective was to build a single MySQL analytical layer and interactive dashboard that connects customer bureau behaviour, the application funnel, lender-partner performance and repayment risk at an auditable grain.

## Architecture

![Analytics architecture](../public/assets/architecture.png)

Seven normalised source tables preserve operational grain. Twelve MySQL views aggregate those tables into purpose-built analytical sources. Each dashboard view consumes the source matching its analytical grain, reducing fan-out and double counting.

## Findings

### 1. Conversion must be risk adjusted

Approval and disbursal volume are incomplete partner KPIs. The simulated partners show materially different first-payment default and PAR outcomes even with similar origination volumes. Incremental allocation should follow a controlled scorecard that accounts for product, ticket size, bureau band and cohort age.

### 2. First-cycle performance is an operational control point

The simulated FPD rate is 23.1%. First-instalment failure can indicate affordability stress, mandate failure, onboarding defects or fraud, so it deserves a separate outreach and diagnostic path.

### 3. Early warning should lead to treatment

A warning score is useful only when it produces a clear action. The queue pairs every account with a severity segment and suggested response so collections leaders can manage capacity and monitor outcomes. It is a sorting aid for human review, not an automated credit decision.

### 4. Vintage and roll rates reveal deterioration earlier

Static PAR shows where the book stands today. Vintage analysis shows whether comparable cohorts are worsening faster, while roll rates separate stable accounts, cures and forward migration. Together they surface deterioration before aggregate PAR fully reflects the change.

## Recommended operating model

| Cadence | Dataset or decision | Owner | Control |
| --- | --- | --- | --- |
| Daily | Applications, decisions, disbursals and payments | Data Engineering | Row counts, freshness and orphan checks |
| Weekly | Early-warning collections queue | Collections Risk | Queue coverage, contact outcomes and cures |
| Monthly | DPD, PAR, FPD, vintage and roll rates | Portfolio Risk | Ledger reconciliation and cohort sign-off |
| Quarterly | Partner scorecard and allocation | Risk and Partnerships | Risk-adjusted economics and policy actions |

## Recommended next decision

Pilot the partner scorecard and alert queue for one monthly cycle. Require metric reconciliation, named owners and documented actions before the output influences partner allocation or policy.
