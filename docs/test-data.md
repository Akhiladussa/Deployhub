\# Test Data — Keep this file safe



\## AWS Resources

RDS Endpoint:       deployhub-db.cdwcyak4k13l.ap-south-1.rds.amazonaws.com

DB Name:            deployhub

DB Username:        deployhub\_admin

DB Password:        PickAStrongPassword123!



\## Tenant UUIDs (from RDS)

Company A UUID:     36059f0e-0e5a-4ded-a1dd-1006688e0186

Company B UUID:     a46ce7ed-213c-4e65-b4c8-8194b9e271b3



\## Cognito

User Pool ID:       ap-south-1\_ubeh1TDWD

App Client ID:      90pd9rt6ae9b7r2caapih4df8
Company A user: companyA@test.com / TestPass123!
Company B user: companyB@test.com / TestPass123!



\## Test Users

Company A user:     companyA@test.com / TestPass123!

Company B user:     companyB@test.com / TestPass123!


API_URL:https://sbmwvgqtp5.execute-api.ap-south-1.amazonaws.com/dev/tasks

## API Gateway
API ID: ksh3sl6abk
API URL: https://ksh3sl6abk.execute-api.ap-south-1.amazonaws.com/dev
Endpoints:
  POST /tasks — create a task
  GET  /tasks — get all tasks for tenant

## Lambda Functions
create-task — inserts task into RDS
get-tasks   — reads tasks filtered by tenant_id



