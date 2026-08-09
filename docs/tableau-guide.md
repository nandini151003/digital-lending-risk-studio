# Tableau Build Guide

The React experience is the public interactive artefact. This guide documents how the same decision story can be reproduced in Tableau using the MySQL views in `sql/03_analytics_views.sql`.

## Data sources

Create one Tableau data source per analytical grain. Do not physically join the views.

1. `vw_application_funnel`
2. `vw_partner_risk`
3. `vw_customer_bureau_features`
4. `vw_current_portfolio`
5. `vw_delinquency_trend`
6. `vw_vintage_par30`
7. `vw_roll_rate`
8. `vw_early_warning`

## Dashboard 1: lender comparison and funnel

- KPI tiles: applications, approval rate, disbursals, outstanding, PAR 30 and FPD
- Lender table: approval, FPD, PAR 30 and exposure
- Funnel: submitted, bureau processed, approved and disbursed
- Filter action: lender selection updates every main sheet

## Dashboard 2: bureau-risk profile

- Risk distribution donut
- Approval rate by risk band
- Utilisation bands
- Credit enquiry and overdue exposure KPIs

## Dashboard 3: delinquency and vintage

- Monthly 30+, 60+ and 90+ trend
- Current DPD mix
- Vintage heatmap using origination month on rows and MOB on columns
- Roll-rate matrix using starting and ending DPD buckets

## Dashboard 4: alerts and recommendations

- Severity KPI tiles
- Exposure by segment
- Prioritised account queue
- Suggested treatment and warning score

## Interaction and refresh controls

- Show reporting date and data freshness in the subtitle.
- Apply equivalent filters across independent data sources.
- Sort alert rows by severity, warning score and exposure.
- Add reset controls to restore the portfolio view.
- Run every query in `sql/04_quality_checks.sql` before refreshing extracts.

## Percentage formatting

Fields ending in `_pct` are already stored as percentages on a 0 to 100 scale. Do not multiply them by 100 again in Tableau.
