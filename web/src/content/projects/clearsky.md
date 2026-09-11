---
name: ClearSky — AWS posture and cost platform
status: completed
summary: Scans multiple AWS accounts for security, cost and inventory findings. Deterministic detectors create the findings; a read-only AI investigator explains them without changing resources.
stack: [Lambda, DynamoDB, Cognito, CloudFront, Terraform]
image: /assets/img/clearsky-architecture.png
imageAlt: "ClearSky architecture: CloudFront and Cognito in front of Lambda function URLs, DynamoDB, EventBridge and cross-account IAM roles"
repo: https://github.com/arkhiVd/clearsky
order: 1
featuredOrder: 1
kicker: serverless · 2026
lede: A serverless platform that scans AWS accounts for security, cost and inventory findings. Deterministic rules detect problems; a read-only AI investigator explains them.
---
