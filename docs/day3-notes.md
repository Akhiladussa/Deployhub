\# Day 3 — Databases + Auth Notes



\## What I built

\- RDS PostgreSQL with tenants, users, tasks tables

\- DynamoDB ActivityLogs table

\- Cognito user pool with custom tenant\_id attribute

\- Two test tenants: Company A and Company B

\- Two Cognito users, each tagged with their tenant UUID



\## The key insight today

Every table has a tenant\_id column. When a user logs in,

Cognito puts their tenant\_id inside the JWT token.

Later, Lambda will read that tenant\_id from the token

and use it to filter every database query — so Company A

can never see Company B's data, even though they share

the same table.



\## Screenshots taken

\- RDS isolation query — Company A sees only its tasks

\- jwt.io showing custom:tenant\_id in token payload

\- DynamoDB ActivityLogs table Active status

