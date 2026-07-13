# portfolio-infra

Single Terraform stack behind [www.aravindakrishnan.cloud](https://www.aravindakrishnan.cloud) —
a static site on CloudFront + S3 with a serverless visitor-counter API, shipped
through OIDC-authenticated GitHub Actions (no stored AWS keys).

## Architecture

- **S3** (private bucket, OAC) + **CloudFront** (PriceClass_100) — static site from `site/`
- **Lambda Function URL** — visitor counter API. Replaces API Gateway entirely
  ($0, CORS owned by the Function URL `cors {}` block via `allowed_origins`)
- **DynamoDB** (on-demand) — visitor counts with HMAC-pseudonymized IP dedupe
- **ACM** (us-east-1) for the custom-domain cert, DNS-validated via **Namecheap** (no Route 53)

Terraform injects the Function URL into `templates/visitorscript.js.tftpl` and
uploads it as `assets/js/visitorscript.js` — no manual API URL copying.

## Cost profile

All components are pay-per-use: CloudFront's always-free tier (1 TB egress,
10M requests/month), Lambda (1M requests/month) and DynamoDB (25 GB) cover this
workload indefinitely; S3 stores a few MB. DNS lives at the registrar, so
Route 53's hosted-zone fee is avoided. Steady-state cost rounds to zero.

## Deploy steps

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
