---
name: CI/CD for AWS container services
status: live
summary: Deploys the same containerized Python application to ECS Fargate and App Runner. Both pipelines use Terraform for infrastructure and OIDC instead of stored AWS credentials.
stack: [ECS Fargate, App Runner, Docker, Terraform]
image: /assets/img/containers-architecture.png
imageAlt: "Container application architecture: an Application Load Balancer routes traffic to ECS Fargate tasks in private subnets"
repo: https://github.com/arkhiVd/aws-ecs-containerized-webapp
secondaryRepo:
  label: App Runner source
  url: https://github.com/arkhiVd/aws-apprunner-containerized-webapp
order: 5
kicker: containers · CI/CD
lede: A push-to-deploy pipeline for a Dockerized Python application on ECS Fargate, with Terraform infrastructure and short-lived AWS credentials from GitHub OIDC.
---
