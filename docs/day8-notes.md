## Day 8 — Monitoring & Live Dashboard

### CloudWatch Monitoring
- Created a CloudWatch dashboard (`deployhub-dashboard`) tracking Lambda invocations 
  across all 5 functions (create-task, get-tasks, update-task, delete-task, task-worker)
- Set up 2 CloudWatch alarms with SNS email notifications:
  - `deployhub-lambda-errors` — triggers on any Lambda error within a 5-min window
  - `deployhub-api-errors` — triggers when API Gateway 5XX errors exceed 5 in 5 minutes

### Production Debugging (real incident, real fix)
- Diagnosed and resolved a live authentication failure: RDS master password had 
  drifted out of sync with the credential stored for Lambda use
- Root-caused via CloudWatch Logs (`aws logs tail`), not guesswork
- Discovered and fixed a deployment mistake where a config update had wiped 
  Lambda environment variables (DB_HOST, DB_USER, DB_PASS, DB_NAME) on all 
  4 CRUD functions — restored across create-task, get-tasks, update-task, delete-task
- Practical lesson: `update-function-configuration --environment` overwrites the 
  entire variable set rather than merging — always fetch and preserve existing 
  variables before updating

### Live Dashboard Webpage
- Built a static HTML/JS dashboard that authenticates directly against Cognito's 
  InitiateAuth REST API and calls the live API Gateway endpoint — no backend 
  server, no SDK dependency
- Enabled CORS on API Gateway (`/tasks` resource) and added 
  `Access-Control-Allow-Origin` headers directly in Lambda responses 
  (get-tasks, create-task) since API Gateway's CORS config alone doesn't 
  inject headers into Lambda proxy responses
- Verified full CRUD flow (create, read, delete) working end-to-end through the UI
- **Proved live tenant isolation**: created a second test tenant (Company B), 
  reset its Cognito password via `admin-set-user-password --permanent`, and 
  confirmed Company A and Company B see completely separate task lists using 
  the same login flow and same codebase — isolation enforced by tenant_id 
  extracted from the verified JWT, never from user input