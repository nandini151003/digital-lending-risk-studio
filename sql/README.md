# MySQL Analytical Layer

Run the files in numerical order on MySQL 8.0 or later.

1. `01_schema.sql` creates seven normalised source tables with keys, constraints and indexes.
2. `02_seed_demo_data.sql` generates a deterministic 600-customer synthetic portfolio.
3. `03_analytics_views.sql` creates twelve purpose-built views for funnel, bureau, partner, portfolio, FPD, vintage, roll-rate and alert analysis.
4. `04_quality_checks.sql` runs orphan, timeline, maturity and reconciliation gates.

The reporting cut-off is fixed at 31 July 2026 for reproducibility. A production implementation should use a governed reporting-date control table rather than a hard-coded date.
