---
name: Cloud portfolio infrastructure
status: live
summary: Runs this site from private S3 behind CloudFront and counts visitors with Lambda and DynamoDB. Terraform and separate OIDC plan and apply workflows manage the stack.
stack: [CloudFront, S3, Lambda, DynamoDB, Terraform, Astro]
image: /assets/img/architecture-diagram.png
imageAlt: "Portfolio architecture: CloudFront serves private S3 content and routes visitor requests to Lambda and DynamoDB"
repo: https://github.com/arkhiVd/portfolio-infra
order: 4
kicker: serverless delivery · live
lede: "The infrastructure behind this portfolio: private static content through CloudFront, a serverless visitor API, and separate OIDC workflows for reviewing and applying Terraform changes."
---
