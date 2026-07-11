# Day 7 — CI/CD Pipeline

## What I built
- S3 bucket for pipeline artifacts
- IAM roles for CodePipeline and CodeBuild
- buildspec.yml defining build instructions
- CodeStar connection to GitHub
- CodeBuild project running on Linux container
- CodePipeline with Source (GitHub) and Build stages
- SNS notifications for pipeline success/failure

## How it works
1. Push code to GitHub main branch
2. CodePipeline detects change within seconds
3. Downloads code → stores in S3 artifact bucket
4. Triggers CodeBuild with that code
5. CodeBuild runs buildspec.yml:
   - npm install for each Lambda
   - zip each function
   - aws lambda update-function-code for each
6. All 4 Lambdas updated in ~2-3 minutes
7. Email notification sent on success/failure

## Proof
- Pipeline showed Succeeded on both stages
- Added version field to get-tasks response
- Pushed to GitHub, pipeline ran automatically
- GET /tasks response now shows "version": "v2.0-cicd"
- Zero manual steps after the git push

## Why this matters
Before: deploy = 10 minutes of manual CloudShell work
After:  deploy = git push (pipeline does everything else)

This is how every real DevOps team deploys code.