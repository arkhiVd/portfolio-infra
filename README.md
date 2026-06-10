# portfolio-infra

Streamlined single-stack rebuild of the portfolio (previously split across
`portfolio-frontend` + `portfolio-backend`, ap-south-1). Local Terraform state.
Goal: ~₹0/month.

## Architecture

- **S3** (private bucket, OAC) + **CloudFront** (PriceClass_100) — static site from `site/`
- **Lambda Function URL** — visitor counter API. Replaces API Gateway entirely
  ($0, CORS owned by the Function URL `cors {}` block via `allowed_origins`)
- **DynamoDB** (on-demand) — visitor counts with HMAC-pseudonymized IP dedupe
- **ACM** (us-east-1) for the custom-domain cert, DNS-validated via **Namecheap** (no Route 53)

Terraform injects the Function URL into `templates/visitorscript.js.tftpl` and
uploads it as `assets/js/visitorscript.js` — no manual API URL copying.

## Why this account

CloudFront's **always-free tier** (1 TB egress + 10M requests/month) never expires,
even after the 12-month free tier ends. Lambda (1M req/mo) and DynamoDB (25 GB) are
always-free too. Only S3 storage bills after 12 months — a few MB ≈ ₹0. Route 53 is
avoided ($0.50/mo); Namecheap provides free DNS. Net ≈ ₹0/mo.

The original new account (348032171026) is on the **AWS Free account plan**, which
hard-blocks CloudFront/MSK with a misleading "account must be verified" error
(`aws freetier get-account-plan-state` → `accountPlanType: FREE`). Unfixable without
a paid upgrade — so this stack targets the older account where CloudFront is unlocked.

## Status (2026-06-10)

- Full stack written + `terraform validate` clean. Lambda+DynamoDB+Function URL
  previously applied & verified in the free-plan account (counter increments, same-IP
  dedupe, single CORS header after fix), then **all destroyed** — state empty.
- `counter.py` no longer sets CORS headers (Function URL owns CORS; avoids `*, *` bug).
- CloudFront + ACM custom-domain wiring added, gated by `var.domain_name`.

## Deploy steps (in the CloudFront-unlocked account)

1. Switch AWS CLI creds to that account (`aws configure` or a named profile;
   confirm with `aws sts get-caller-identity`).
2. `cp terraform.tfvars.example terraform.tfvars` → set `ip_hash_secret`
   (`openssl rand -hex 32`). `terraform init`.
3. **First apply, no domain** — verify CloudFront works:
   `terraform apply` (domain_name defaults to ""). Site at `https://<id>.cloudfront.net`.
4. Buy `aravindakrishnan.cloud` at Namecheap (~₹400/yr).
5. Set `domain_name = "aravindakrishnan.cloud"` (in tfvars), then:
   - `terraform apply -target=aws_acm_certificate.portfolio_cert`
   - `terraform output acm_validation_records` → add those CNAME(s) in
     Namecheap **Advanced DNS**
   - `terraform apply` (full) — waits for validation, then attaches the cert to CloudFront
6. Point the domain at CloudFront in Namecheap Advanced DNS:
   - `www` → **CNAME** → `<cloudfront_domain_name>` output
   - apex `@` → Namecheap **URL Redirect Record** → `https://www.aravindakrishnan.cloud`
     (Namecheap BasicDNS has no apex ALIAS/CNAME; CloudFront only ever serves www)
7. Tighten `allowed_origins = ["https://www.aravindakrishnan.cloud","https://aravindakrishnan.cloud"]`; re-apply.
8. Move state to a remote backend; push to repos.

## CI/CD (GitHub Actions, OIDC — no stored AWS keys)

Deploys run from GitHub Actions; **no long-lived AWS credentials exist anywhere**.
Actions authenticate to AWS via **OIDC** and assume short-lived, scoped IAM roles.

- `bootstrap/` (local state, run once with admin creds) provisions: the S3 **state
  bucket** (versioned, encrypted, TLS-only), the **GitHub OIDC provider**, and two
  IAM roles —
  - `portfolio-ci-plan` — **read-only**, assumable only from `pull_request` runs
  - `portfolio-ci-apply` — **scoped write**, assumable only from `main` branch pushes
- `.github/workflows/plan.yml` — on PR: fmt → validate → checkov → `plan`, posts the
  plan as a PR comment (plan role).
- `.github/workflows/apply.yml` — on merge to `main`: `apply` + CloudFront
  invalidation (apply role).
- Actions are pinned to commit SHAs; `checkout` uses `persist-credentials: false`.

### Editing the site

Edit files in `site/` → open a PR → review the plan comment → merge. Merge to `main`
auto-deploys and invalidates the CDN cache.

### One-time setup

```sh
cd bootstrap && terraform init && terraform apply   # creates state bucket + OIDC + roles
cd ..           && terraform init                   # migrate main stack to the S3 backend
```

Then set repo secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `AWS_PLAN_ROLE_ARN`  | `bootstrap` output `ci_plan_role_arn` |
| `AWS_APPLY_ROLE_ARN` | `bootstrap` output `ci_apply_role_arn` |
| `IP_HASH_SECRET`     | `openssl rand -hex 32` (Lambda IP-hash salt; never in repo) |

Protect `main`: require a PR + a passing plan check; block direct pushes.

## Local usage (break-glass / bootstrap only)

```sh
terraform init
terraform plan
terraform apply   # needs ip_hash_secret in terraform.tfvars (gitignored)
```
