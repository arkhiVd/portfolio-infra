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

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Run a complete product platform within a strict cost limit</h2>
    <p>
      The platform needed an admin frontend, eight APIs, two background workers, PostgreSQL,
      Redis, OpenSearch and queue-based processing. The infrastructure also had to remain small
      enough for a personal AWS account and reproducible enough to remove when it was not being
      tested.
    </p>
    <p>
      The application runs locally as the same set of services used by the AWS design. LocalStack
      provides S3 and SQS, while real PostgreSQL, Redis and OpenSearch containers avoid replacing
      cloud dependencies with simpler substitutes.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Separate request traffic from background processing</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>
        CloudFront serves the frontend and forwards API traffic to an ALB. ECS services use
        PostgreSQL, Redis and OpenSearch; S3 events and SQS queues feed the PDF-ingest and
        search-sync workers.
      </figcaption>
    </figure>
    <p>
      Requests follow CloudFront → ALB → ECS → data services. File imports and search updates use
      S3 and SQS so bursts of background work do not block API requests. Each queue has a dead-letter
      queue for messages that cannot be processed successfully.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row">
        <dt>ECS on EC2 instead of Fargate</dt>
        <dd>
          Ten workloads share one small instance. This lowers compute cost but gives the platform
          less isolation and capacity than separate Fargate tasks.
        </dd>
      </div>
      <div class="row">
        <dt>No NAT gateway</dt>
        <dd>
          ECS runs in a security-group-restricted public subnet, while databases remain private.
          S3 and DynamoDB gateway endpoints cover those service paths. The design saves the fixed
          NAT cost but requires tighter control of the compute subnet.
        </dd>
      </div>
      <div class="row">
        <dt>SQS workers instead of synchronous jobs</dt>
        <dd>
          PDF imports and search updates can retry independently and cannot hold open an API request.
          The tradeoff is eventual consistency and additional failure handling.
        </dd>
      </div>
      <div class="row">
        <dt>One CloudFront origin for frontend and API paths</dt>
        <dd>
          CloudFront serves S3 content and forwards API paths to the ALB under one hostname, removing
          the need for browser CORS configuration.
        </dd>
      </div>
    </dl>
  </section>

  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>Local services used the wrong SQS region</h2>
    <p>
      LocalStack created queues in its default region while the application requested them from
      <code>ap-south-1</code>. The queue names were correct, but every worker reported that its queue
      did not exist. Creating the local queues in the same configured region fixed the mismatch.
    </p>
    <p>
      A second container failure came from the worker image. The Prometheus ASP.NET package required
      the ASP.NET shared framework, but the workers used the smaller .NET runtime image. They exited
      at startup until their Dockerfiles switched to the ASP.NET runtime base.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">numbers</p>
  <h2>Current scope</h2>
    <ul class="metrics">
      <li><b>8</b><span>application services</span></li>
      <li><b>2</b><span>background workers</span></li>
      <li><b>16</b><span>containers in the complete local environment</span></li>
      <li><b>121</b><span>Terraform resources in the clean cloud plan</span></li>
    </ul>
    <p>
      The local application is complete and the infrastructure modules were applied and removed once.
      The current 121-resource cloud deployment plan is complete; a full application deployment to AWS
      remains pending.
    </p>
  </section>
