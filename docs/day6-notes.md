# Day 6 — Async Messaging with SQS + SNS

## What I built
- SQS queue: deployhub-task-events
- Dead Letter Queue: deployhub-task-events-dlq
- SNS topic: deployhub-notifications with email subscription
- task-worker Lambda triggered by SQS
- Updated create-task to publish to SQS after RDS insert

## The async flow
1. User calls POST /tasks
2. create-task Lambda saves to RDS
3. create-task publishes message to SQS
4. create-task returns 201 immediately to user
5. SQS triggers task-worker Lambda (separately)
6. task-worker writes activity log to DynamoDB
7. task-worker publishes to SNS
8. SNS sends email to subscriber

## Why this matters
User never waits for logging or email.
If email service is down, task creation still works.
Failed messages go to DLQ after 3 retries — no data loss.

## Proof
- DynamoDB ActivityLogs shows new entry after task creation
- Email received with task details
- SQS queue empties after worker processes message
- CloudWatch logs show worker ran successfully

## Key AWS concepts learned
- Event source mapping — SQS triggers Lambda automatically
- Dead Letter Queue — catches failed messages
- Pub/Sub pattern — SNS broadcasts to multiple subscribers
- Decoupled architecture — services don't call each other directly