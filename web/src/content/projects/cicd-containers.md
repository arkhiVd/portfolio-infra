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
additionalFigures:
  - image: /assets/img/containers-cicd.png
    imageAlt: "CI/CD pipeline from a GitHub push through OIDC authentication, Docker build, ECR and Terraform deployment to ECS"
order: 5
kicker: containers · CI/CD
lede: A push-to-deploy pipeline for a Dockerized Python application on ECS Fargate, with Terraform infrastructure and short-lived AWS credentials from GitHub OIDC.
---

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Deploy containers without stored AWS keys or manual server work</h2>
    <p>The project needed a repeatable path from a source commit to a running container. Infrastructure, image version and deployment state had to remain reviewable rather than being assembled manually in the AWS console.</p>
  </section>
  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Public load balancer, private application tasks</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>The public Application Load Balancer is the only internet-facing application component. It forwards requests to Flask containers running as ECS Fargate tasks in private subnets; CloudWatch receives task logs.</figcaption></figure>
    <p>Security-group ingress ties the ECS service directly to the load balancer security group instead of allowing a broad network range. Terraform defines the VPC, subnets, ECR repository, load balancer, ECS cluster, task definition and service.</p>
    <figure class="arch" data-project-figure="1">
<figcaption>GitHub Actions assumes an AWS role with OIDC, builds a commit-addressed image, pushes it to ECR and passes that image URL into Terraform.</figcaption></figure>
  </section>
  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row"><dt>OIDC instead of repository access keys</dt><dd>GitHub receives temporary AWS credentials for each run. IAM trust configuration is more involved, but there is no long-lived secret to rotate or leak.</dd></div>
      <div class="row"><dt>Commit SHA image tags</dt><dd>Each task definition points to an immutable, traceable build rather than an ambiguous <code>latest</code> tag.</dd></div>
      <div class="row"><dt>Fargate instead of managed EC2 hosts</dt><dd>The deployment avoids patching container hosts. Per-task pricing can cost more than well-utilized EC2 capacity.</dd></div>
      <div class="row"><dt>Terraform receives the image URL</dt><dd>Application versions and infrastructure changes share one plan, while the infrastructure remains independent of a hardcoded build.</dd></div>
    </dl>
  </section>
  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>The deployment needs an explicit image handoff</h2>
    <p>Building and pushing an image does not update a running ECS service by itself. The workflow must pass the commit-tagged ECR URL into Terraform so a new task-definition revision is created and ECS can perform the rolling replacement.</p>
  </section>
  <section class="block wrap">
  <p class="label">pipeline</p>
  <h2>From push to healthy task</h2>
    <ul class="metrics"><li><b>1</b><span>public entry point</span></li><li><b>0</b><span>stored AWS access keys</span></li><li><b>3</b><span>pipeline stages: build, plan, apply</span></li><li><b>SHA</b><span>identifies every deployed image</span></li></ul>
  </section>
