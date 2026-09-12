---
name: Microservices platform infrastructure
status: in progress
summary: Terraform infrastructure for eight .NET services and two background workers on ECS. The design separates request traffic from S3 and SQS event processing and avoids a NAT gateway.
stack: [ECS on EC2, RDS, OpenSearch, SQS, Terraform]
image: /assets/img/appstack-architecture.png
imageAlt: "AppStack architecture: ALB in front of ECS on EC2, with RDS Postgres, Redis, OpenSearch and SQS workers inside one VPC"
repo: https://github.com/arkhiVd/appstack-infra
order: 2
featuredOrder: 2
kicker: AWS platform · 2026
lede: Terraform infrastructure and a working local environment for a .NET microservices platform. Eight services and two workers share a synchronous API path and an asynchronous S3 and SQS path.
---
