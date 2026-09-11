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

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Reproducible findings without giving AI control</h2>
    <p>
      Security scanners are usually opaque: a score appears and the reasoning behind it
      belongs to someone else. I wanted findings that were reproducible — the same account
      state producing the same findings every time — with any AI strictly additive, able to
      explain and investigate but never to decide what counts as a finding.
    </p>
    <p>
      The second constraint was running cost. The platform uses no always-on compute, NAT
      gateway or managed scanner. Its deployment pipeline can also remove the complete stack
      when it is not needed.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Serverless scanning with read-only account access</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>
        A private S3 bucket behind CloudFront with origin access control serves a multipage
        dashboard; one Lambda behind a function URL handles the API; DynamoDB holds the
        finding lifecycle; member accounts are reached by cross-account assume-role.
      </figcaption>
    </figure>
    <p>
      The detectors are pure functions — API responses in, findings out — so they are tested
      against fixtures rather than mocked against live AWS. The whole backend runs on the
      Python standard library plus boto3: no layers, no third-party packages, nothing to
      patch. JWT verification, RS256 included, is implemented in-process against Cognito's
      JWKS.
    </p>
    <p>
      Login is a custom page rather than Cognito's hosted UI, authenticating with
      <code>USER_PASSWORD_AUTH</code> over fetch, which is what makes the new-password,
      forgot-password and silent-refresh flows behave the way the rest of the dashboard does.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row">
        <dt>A Lambda function URL instead of API Gateway</dt>
        <dd>
          One less service to run and pay for. The tradeoff is real: no usage plans and no
          request validation, so validation lives in the handler.
        </dd>
      </div>
      <div class="row">
        <dt>Detectors as pure functions</dt>
        <dd>
          Deterministic and fixture-testable, which is what makes a finding trustworthy. The
          cost is that every new AWS API shape needs a fixture before it needs a detector.
        </dd>
      </div>
      <div class="row">
        <dt>Read-only IAM as the AI's hard boundary</dt>
        <dd>
          The agent's tool loop is limited to describe, list and get calls. It cannot change
          account resources. IAM enforces that boundary independently of the model prompt.
        </dd>
      </div>
      <div class="row">
        <dt>A zero-dependency backend</dt>
        <dd>
          No supply chain to audit and no layer builds in CI. The cost is code written by
          hand that a library would otherwise provide, including RS256 verification.
        </dd>
      </div>
      <div class="row">
        <dt>Cost Explorer results cached per preset per day</dt>
        <dd>
          Cost Explorer charges per query. Caching keeps a page that is all about cost from
          being the expensive part of the platform.
        </dd>
      </div>
    </dl>
  </section>

  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>Terraform dependency ordering blocked cleanup</h2>
    <p>
      Terraform attempted to delete the origin access control before detaching it from the
      CloudFront distribution, and AWS returned a dependency conflict. Applying the
      distribution change first, then running the complete apply, allowed Terraform to remove
      the detached resource cleanly.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">numbers</p>
  <h2>Scope and test coverage</h2>
    <ul class="metrics">
      <li><b>24+</b><span>read-only detectors, every enabled region</span></li>
      <li><b>113</b><span>unit tests against fixtures</span></li>
      <li><b>66</b><span>findings on the first real scan (35 high, 9 medium, 22 low)</span></li>
      <li><b>none</b><span>left running — destroyed from its own pipeline</span></li>
    </ul>
    <p>
      A push to <code>main</code> can recreate the platform after the stack has been removed.
      Terraform, the application source and the deployment workflows contain everything needed
      to rebuild it.
    </p>
  </section>
