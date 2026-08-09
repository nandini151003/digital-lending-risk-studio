# Privacy and Public Release Design

## Public data classification

Every customer, lender, account, tradeline, application, repayment and outcome in this repository is synthetic. Names such as Aurora Bank and Summit Capital are fictional demonstration labels.

## What is included

- Rounded and aggregated portfolio metrics
- Synthetic lender and account identifiers
- Deterministic SQL generation logic
- Sanitised dashboard visuals
- A metadata-scrubbed source case-study document
- Public analytical definitions and governance controls

## What must never be committed

- Real customer names, phone numbers, emails, addresses or government identifiers
- Raw bureau reports or enquiry histories
- Real account, application or partner identifiers
- Database credentials or connection files
- Unaggregated company exports
- Private Tableau extracts or packaged workbooks containing confidential data

The `data/raw/` folder is ignored by Git. The automated privacy check scans repository text for common secret patterns and prohibited private-data filenames.

## Portfolio boundary

This repository demonstrates an analytical method. It is not a live credit decision system and must not be used to approve, reject, price or collect from a person.
