@"
# Day 5 — Full CRUD + Security Hardening

## What I built
- update-task Lambda: updates task only if tenant_id matches
- delete-task Lambda: deletes task only if tenant_id matches
- PUT /tasks/{id} and DELETE /tasks/{id} in API Gateway
- DB credentials moved from plain env vars to Secrets Manager (all 3 Lambdas: create-task, update-task, delete-task)
- IAM role updated with SecretsManager read permission

## Full API now available
POST   /tasks         create task
GET    /tasks         list tenant's tasks
PUT    /tasks/{id}    update task (tenant-scoped)
DELETE /tasks/{id}    delete task (tenant-scoped)

## Key security proof today
Tried to update AND delete Company A's task using Company B's token.
Result: "Task not found or not yours" on both - isolation
enforced at UPDATE and DELETE level too, not just SELECT.

## Key lesson - double WHERE clause
UPDATE tasks SET ... WHERE task_id = `$4 AND tenant_id = `$5
DELETE FROM tasks WHERE task_id = `$1 AND tenant_id = `$2
Both conditions must match. Task ID alone is not enough.
This prevents cross-tenant data modification attacks.

## Bug found and fixed - subnet routing
delete-task started intermittently timing out (30s) after the
Secrets Manager migration, while create-task and update-task worked
fine with identical code and VPC config.

Root cause: the Lambda's two subnets weren't both routing through
the NAT Gateway. One subnet had an explicit route table with a NAT
Gateway route. The other had no explicit route table association,
so it fell back to the VPC's main route table - which only had a
local route, no NAT. Any Lambda container that landed in that
subnet couldn't reach Secrets Manager over the internet, and just
hung until Lambda's timeout killed it.

Fix: associated the broken subnet with the same route table as the
working one, so both subnets route outbound traffic through the
same NAT Gateway.

Lesson: when a Lambda is configured across multiple subnets, verify
ALL of them have equivalent outbound routing - don't assume they're
symmetric just because they're in the same VPC.

## Password rotation
Rotated the RDS master password after it had been exposed in
plaintext during earlier debugging (env vars, terminal history).
Updated both the RDS instance (modify-db-instance) and the
Secrets Manager secret to match. No Lambda code changes needed -
all three functions read the secret at runtime, so they picked up
the new password automatically after a cold start.

## Screenshots
- All 4 curl tests showing correct responses (GET/POST/PUT/DELETE)
- Company B failing to update AND delete Company A's task
- Secrets Manager showing deployhub/db-credentials
- Route table fix (before/after) for the subnet issue
"@ | Out-File -Encoding utf8 day5-notes.md