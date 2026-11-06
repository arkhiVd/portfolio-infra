---
name: Cloud Detective — AWS account scanner
status: completed
summary: The project that preceded ClearSky. It scans AWS cost, inventory and security posture, tracks findings over time, and generates architecture diagrams from discovered resources.
stack: [Lambda, API Gateway, Cognito, DynamoDB, Terraform]
image: /assets/img/cloud-detective-scan.svg
imageAlt: "Cloud Detective daily scan: EventBridge Scheduler invokes the scanner Lambda, which reads the account registry, assumes a read-only role in member accounts, and writes findings to DynamoDB, snapshots to S3 and a digest to SNS"
repo: https://github.com/arkhiVd/cloud-detective
additionalFigures:
  - image: /assets/img/cloud-detective-dashboard.svg
    imageAlt: "Cloud Detective dashboard: API Gateway checks a Cognito token before one Lambda serves the dashboard and starts the chat agent, the architecture worker or a scan; only the model call goes to an external provider"
order: 6
kicker: serverless · 2026
lede: A serverless AWS scanner for cost, inventory and security posture. It tracks findings and generates diagrams from discovered resources. Detection stays deterministic, and an optional AI agent investigates on top.
---

<section class="block wrap">
  <p class="label">problem</p>
  <h2>One view of AWS cost, inventory and exposure</h2>
    <p>
      Cloud accounts drift. Resources outlive the reason they were created, cost appears in
      places nobody looks, and the only complete picture of what exists is whatever the
      console will show you one page at a time. I wanted a system that answered three
      questions on a schedule — what is running, what is it costing, what is exposed — and
      could then explain any single answer without me going back to the console.
    </p>
    <p>
      Detection and diagram generation are deterministic, fixture-tested and read-only. The AI
      layer is optional and stays off until a provider key is set. The scheduled detectors produce
      the findings. The chat agent can add one it confirms on a live resource or mark one resolved,
      but its AWS access is read-only.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Scheduled scans, finding history and generated diagrams</h2>
    <p>
      Daily detectors scan the account and write findings into DynamoDB with a real
      lifecycle — new, open, resolved — so a finding that comes back is not indistinguishable
      from one that never left. A plain-text digest goes out by SNS.
    </p>
    <figure class="arch" data-project-figure="0">
<figcaption>EventBridge Scheduler runs the scanner Lambda daily. It reads the account registry, assumes a read-only role in each member account, reconciles findings in DynamoDB, writes snapshots to S3 and sends the digest through SNS.</figcaption></figure>
    <p>
      On top of that sits a Cognito-authenticated dashboard, an LLM chat that investigates the
      live account through read-only AWS calls, and an on-demand architecture generator that
      emits draw.io XML with AWS icons and an SVG preview.
    </p>
    <figure class="arch" data-project-figure="1">
<figcaption>API Gateway checks the Cognito token before the API Lambda runs. That one Lambda serves the dashboard and starts the chat agent, the architecture worker or a scan. Only the model call leaves AWS.</figcaption></figure>
    <p>
      Multi-account scanning fans out over cross-account read-only roles, tracked in an SSM
      registry that the dashboard writes to when an account is onboarded.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Constraints that shaped the design</h2>
    <dl class="rows">
      <div class="row">
        <dt>Provider-agnostic LLM client instead of Bedrock</dt>
        <dd>
          Bedrock was blocked account-wide, so the AI client was separated from any single
          provider. Model requests are the only part of the workflow sent outside the AWS
          account.
        </dd>
      </div>
      <div class="row">
        <dt>Serve the dashboard from the API Lambda</dt>
        <dd>
          CloudFront was unavailable in this account, so one function serves both the static
          application and the API. This simplified deployment but coupled content delivery to
          the application backend. ClearSky replaced it with a CDN.
        </dd>
      </div>
      <div class="row">
        <dt>Diagram generation as code, not as an AI feature</dt>
        <dd>
          The generator is deterministic: same account state, same diagram. An LLM drawing
          architecture would be plausible and occasionally wrong, which is the worst possible
          property for a diagram someone is about to trust.
        </dd>
      </div>
      <div class="row">
        <dt>Create Cognito users with a permanent password</dt>
        <dd>
          Invite emails were unreliable in practice. Skipping the invite flow removes a
          dependency on email delivery from the critical path of getting in at all.
        </dd>
      </div>
    </dl>
  </section>

  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>Partial scans resolved findings from the wrong accounts</h2>
    <p>
      <strong>Partial scans silently resolved other accounts' findings.</strong> The reconcile
      step assumed each run scanned every account, so any unseen finding was marked resolved.
      Multi-account scans broke that assumption. The fix passes the set of scanned accounts into
      reconciliation and limits resolution to those accounts.
    </p>
    <p>
      <strong>Bedrock was blocked account-wide</strong> — every model, every API. It read
      like an IAM problem and was not; it was a plan-level restriction, confirmed through a
      support ticket. That is what forced the provider-agnostic client above.
    </p>
    <p>
      <strong>The first architecture generator drew arrows through its own boxes.</strong>
      An orthogonal corridor router produced overlapping edges as soon as the graph had any
      depth. It was rewritten into tiered columns with barycenter ordering and per-gap
      channels, later curved beziers. A separate bug had same-named resources in different
      services colliding into one diagram node, fixed by keying every node on
      <code>type:id</code> rather than on its name.
    </p>
  </section>

  <section class="block wrap">
  <p class="label">numbers</p>
  <h2>Scope and outcome</h2>
    <ul class="metrics">
      <li><b>106</b><span>tests, detectors covered by fixtures</span></li>
      <li><b>daily</b><span>scheduled scans with an emailed digest</span></li>
      <li><b>read-only</b><span>access to every scanned resource</span></li>
    </ul>
    <p>
      Cloud Detective became the foundation for ClearSky. The successor retained the detector
      and diagram concepts while replacing the Lambda-served frontend and account-specific AI
      integration.
    </p>
  </section>
