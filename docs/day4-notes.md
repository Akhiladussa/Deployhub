# Day 4 — Lambda + API Gateway

## What I built
- create-task Lambda: reads tenant_id from JWT, 
  inserts task into RDS PostgreSQL
- get-tasks Lambda: reads tenant_id from JWT,
  returns only that tenant's tasks
- API Gateway REST API with /tasks resource
- POST and GET methods with Lambda proxy integration
- Cognito authorizer protecting all endpoints

## API URL
https://ksh3sl6abk.execute-api.ap-south-1.amazonaws.com/dev

## Proof of multi-tenancy isolation
Company A GET /tasks → returns 8 tasks, all with
  tenant_id: 36059f0e-0e5a-4ded-a1dd-1006688e0186

Company B GET /tasks → returns 2 tasks, all with
  tenant_id: a46ce7ed-213c-4e65-b4c8-8194b9e271b3

Company A never sees Company B data. ✅
Company B never sees Company A data. ✅

## The key security line
Lambda reads tenant_id from the JWT token directly:
const payload = JSON.parse(
  Buffer.from(token.split('.')[1], 'base64').toString()
);
tenantId = payload['custom:tenant_id'];

The user cannot fake this value — it comes from
Cognito's signed token only.

## Problems I solved today
1. Lambda proxy integration was OFF — API Gateway
   was sending raw body only, not headers or context
2. pg module missing — fixed by deploying from
   CloudShell with node_modules included in zip
3. SSL certificate error on Windows — used CloudShell
   instead of local curl

## Key lesson
Always enable Lambda proxy integration in API Gateway.
Without it, Lambda never receives headers, auth context,
or path parameters — only the raw request body.

## Screenshots
- day4-company-a-tasks.png
- day4-company-b-tasks.png
- day4-lambda-success.png
- day4-api-gateway.png