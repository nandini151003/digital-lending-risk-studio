# Data Notes

`sanitized-portfolio.json` contains the rounded aggregate metrics used to explain the public demonstration. The React source contains additional synthetic chart and queue records for the interactive experience.

`raw/` is intentionally ignored. Never place real customer, bureau, account, repayment, credential or company export data in the public repository.

To reproduce the synthetic relational portfolio, run the SQL files in numerical order:

1. `sql/01_schema.sql`
2. `sql/02_seed_demo_data.sql`
3. `sql/03_analytics_views.sql`
4. `sql/04_quality_checks.sql`
