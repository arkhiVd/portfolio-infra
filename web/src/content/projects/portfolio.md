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

<section class="block wrap">
  <p class="label">problem</p>
  <h2>Make the portfolio itself verifiable infrastructure work</h2>
    <p>The site needed global HTTPS delivery, no public storage bucket, a small dynamic visitor counter and a deployment path that did not rely on console changes or permanent AWS credentials.</p>
    <p>Astro is used only as a static build system. The deployed output is HTML, CSS and minimal JavaScript served from S3 through CloudFront.</p>
  </section>
  <section class="block wrap">
  <p class="label">architecture</p>
  <h2>Private origin with a serverless API path</h2>
    <figure class="arch" data-project-figure="0">
<figcaption>CloudFront serves the private S3 origin through origin access control. A separate behavior routes the visitor endpoint to Lambda, which atomically updates DynamoDB.</figcaption></figure>
    <p>Route 53 and ACM provide the custom domain and TLS certificate. CloudFront is the only public delivery layer; direct S3 object access remains blocked.</p>
  </section>
  <section class="block wrap">
  <p class="label">decisions and tradeoffs</p>
  <h2>Key design decisions</h2>
    <dl class="rows">
      <div class="row"><dt>Static output instead of an application server</dt><dd>Pages are cheap to cache and have no runtime to patch. Dynamic behavior is limited to isolated serverless endpoints.</dd></div>
      <div class="row"><dt>CloudFront origin access control</dt><dd>The bucket stays private and grants reads only to the distribution, adding policy setup in exchange for removing direct object exposure.</dd></div>
      <div class="row"><dt>Separate plan and apply workflows</dt><dd>Pull requests can review Terraform changes without receiving apply permissions. Merge-time automation has the narrower deployment role.</dd></div>
      <div class="row"><dt>OIDC instead of static AWS secrets</dt><dd>GitHub assumes short-lived roles subject to repository and branch conditions; no AWS access key is stored in Actions.</dd></div>
    </dl>
  </section>
  <section class="block wrap">
  <p class="label">what broke</p>
  <h2>Preview paths exposed base-path assumptions</h2>
    <p>The same static build is served both at the production root and under a preview prefix. Root-relative links worked in production but escaped the preview path. Centralizing URL generation around Astro's configured base fixed navigation, resume and asset links.</p>
    <p>The visitor script is generated with the deployed API URL by Terraform. A local Astro preview therefore cannot report a real count unless that deployment-generated script is injected; the interface intentionally shows a neutral placeholder rather than a fabricated value.</p>
  </section>
  <section class="block wrap">
  <p class="label">delivery</p>
  <h2>Infrastructure and content move together</h2>
    <ul class="metrics"><li><b>100%</b><span>infrastructure defined in Terraform</span></li><li><b>0</b><span>public S3 buckets</span></li><li><b>2</b><span>OIDC deployment roles</span></li><li><b>1</b><span>serverless visitor endpoint</span></li></ul>
  </section>
