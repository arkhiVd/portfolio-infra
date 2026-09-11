# Checkov baseline triage

Checked 2026-09-09 against the full Terraform tree. Checkov reported 116 passed and
30 failed checks. The content expansion changes only the static-file MIME map, so none
of these findings is introduced by this work. This document records disposition; it does
not suppress a check or approve an infrastructure change.

## Intentional architecture or not applicable

- `CKV_AWS_258`, `CKV_AWS_301`: the browser-facing visitor counter intentionally uses a
  public Lambda Function URL. AWS-authenticated clients would break its required behavior.
- `CKV_AWS_117`: the Lambda only needs AWS service APIs; placing it in a VPC would add
  network machinery without a private target.
- `CKV_AWS_116`: the counter is invoked synchronously through its Function URL. A DLQ for
  asynchronous invocation does not cover this request path.
- `CKV_AWS_374`: this public hiring site intentionally has no geographic restriction.
- `CKV_AWS_310`: generated static objects have one private S3 origin. A second origin is
  outside the availability and cost requirements.
- `CKV_AWS_68`, `CKV2_AWS_47`: a WAF would be a separately approved, cost-bearing change.
  The public Lambda concurrency/cost risk still needs its own assessment below.
- `CKV2_AWS_62` on both buckets: event notifications have no required consumer.
- `CKV_AWS_144` on the site bucket: the Git build is the recovery source for generated
  objects; cross-region replication is outside this stack's requirements.
- `CKV_AWS_18` on the site bucket: access logging needs a destination, retention policy
  and privacy review. It is not added merely to satisfy a scanner.
- `CKV2_AWS_61` on the site bucket: immutable build assets and short-lived pages are
  replaced by Terraform; a lifecycle policy has no defined purpose.
- `CKV_AWS_145` on both buckets: both use encryption at rest. The check specifically
  requires a customer-managed KMS key, which adds cost and key administration.
- `CKV_AWS_21` on the site bucket: generated artifacts remain recoverable from Git and
  the build; versioning would retain obsolete deployment objects.

## Conditional/scanner limitations

- `CKV_AWS_174`: both CloudFront certificate branches explicitly set `TLSv1.2_2021`.
- `CKV2_AWS_42`: production uses the conditional ACM certificate branch; the default
  certificate branch exists only when no custom domain is configured.
- `CKV_AWS_111`, `CKV_AWS_356`: the apply role uses `Resource = "*"` for CloudFront and
  ACM operations that lack useful resource-level restriction. Other service writes are
  scoped in `bootstrap/roles.tf`. IAM changes remain Risky and need separate review.
- `CKV_AWS_119`: DynamoDB encrypts at rest with an AWS-owned key; this check requires a
  customer-managed key rather than detecting plaintext storage.

## Separate Risky follow-up

Do not fold these into a content PR:

1. `CKV_AWS_28`: assess DynamoDB point-in-time recovery. The accumulated visitor count is
   real data. Record retention, cost and a restore test before enabling it.
2. `CKV_AWS_115`: assess reserved concurrency for the public Function URL. A limit could
   cap cost and abuse, but an arbitrary value could break legitimate counter requests.
3. `CKV_AWS_272`: assess Lambda code signing and CI integration as a supply-chain change.
4. `CKV_AWS_173`: assess a customer-managed key for the Lambda environment without
   exposing or casually rotating `ip_hash_secret`.
5. `CKV_AWS_86`: assess CloudFront logging with storage, retention, privacy and cost.
6. State-bucket `CKV_AWS_144`, `CKV_AWS_18`, `CKV2_AWS_61`, and `CKV_AWS_145`: review
   recovery, retention, logging, replication and key management together. Bootstrap has
   local state and is admin-only; changes require a rollback plan before implementation.

The correct result for this phase remains a failing advisory Checkov report plus explicit
triage. Making it green by blanket suppression would hide the real resilience and cost
questions.
