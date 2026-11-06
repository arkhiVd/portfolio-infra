---
name: CI/CD for AWS container services
status: live
summary: Deploys the same containerized Python application to ECS Fargate and App Runner. Both pipelines use Terraform for infrastructure and OIDC instead of stored AWS credentials.
stack: [ECS Fargate, App Runner, Docker, Terraform]
image: /assets/img/containers-architecture.svg
imageAlt: "Container application architecture: users reach an internet-facing Application Load Balancer, which forwards to an ECS Fargate task in public subnets that accepts traffic only from the load balancer"
repo: https://github.com/arkhiVd/aws-ecs-containerized-webapp
secondaryRepo:
  label: App Runner source
  url: https://github.com/arkhiVd/aws-apprunner-containerized-webapp
additionalFigures:
  - image: /assets/img/containers-cicd.svg
    imageAlt: "Manually started GitHub Actions pipeline: build and push, Terraform plan and Terraform apply each assume an IAM role through OIDC; the commit-SHA-tagged image goes to ECR and ECS Fargate runs it"
order: 5
kicker: containers · CI/CD
lede: A manually triggered deploy pipeline for a Dockerized Python application on ECS Fargate, with Terraform infrastructure and short-lived AWS credentials from GitHub OIDC.
---

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Deploy containers without stored AWS keys or manual server work</h2>
    <p>The project needed a repeatable path from a source commit to a running container. Infrastructure, image version and deployment state had to remain reviewable rather than being assembled manually in the AWS console.</p>
  </section>
  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Public load balancer, locked-down tasks</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>The internet-facing Application Load Balancer is the only way in. It forwards requests to Flask containers running as ECS Fargate tasks in two public subnets. The tasks have public IPs, but their security group accepts port 8080 only from the load balancer's group. CloudWatch Logs receives the container logs.</figcaption></figure>
    <p>Security-group ingress ties the ECS service directly to the load balancer security group instead of allowing a broad network range. Terraform defines the VPC, subnets, ECR repository, load balancer, ECS cluster, task definition and service.</p>
    <figure class="arch" data-project-figure="1">
<figcaption>A manually started GitHub Actions run assumes an AWS role with OIDC, builds an image tagged with the commit SHA, pushes it to ECR and passes that image URL into Terraform.</figcaption></figure>
  </section>
  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row"><dt>OIDC instead of repository access keys</dt><dd>GitHub receives temporary AWS credentials for each run. IAM trust configuration is more involved, but there is no long-lived secret to rotate or leak.</dd></div>
      <div class="row"><dt>Commit SHA image tags</dt><dd>Each task definition points to a traceable build rather than an ambiguous <code>latest</code> tag. The ECR repository still allows tags to be overwritten, so the SHA is a convention, not an enforced guarantee.</dd></div>
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
  <h2>From a manual run to a healthy task</h2>
    <ul class="metrics"><li><b>1</b><span>reachable entry point</span></li><li><b>0</b><span>stored AWS access keys</span></li><li><b>3</b><span>pipeline stages: build, plan, apply</span></li><li><b>SHA</b><span>identifies every deployed image</span></li></ul>
  </section>
