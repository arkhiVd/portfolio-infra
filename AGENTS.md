# portfolio-infra — agent instructions

## Purpose

Single Terraform stack behind **https://www.aravindakrishnan.cloud** — a static site on
CloudFront + S3 with a serverless visitor counter, shipped through OIDC-authenticated
GitHub Actions. This is a public, hiring-visible repo: the git history is part of the
portfolio. It is currently being rebuilt (site layer only) per `SPEC.md` and `ROADMAP.md`.

## Architecture

- `frontend.tf` — S3 (private, OAC), CloudFront (PriceClass_100), ACM cert, the
  `aws_s3_object` uploads, and `local.mime_types`. **`local.mime_types` decides the
  `Content-Type` of every uploaded file; anything unmapped becomes
  `binary/octet-stream`** and fonts, SVG, or `sitemap.xml` break silently.
- `backend.tf` — Lambda Function URL visitor counter, DynamoDB table, IAM for the Lambda.
- `versions.tf` — S3 remote state (native lockfile locking), provider pins.
- `bootstrap/` — **separate substack, local state, run once as admin.** State bucket,
  GitHub OIDC provider, and the two scoped CI roles. Do not touch during site work.
- `templates/visitorscript.js.tftpl` → uploaded as `assets/js/visitorscript.js`; injects
  the Lambda Function URL so it is never hand-copied. The site reads `window.VISITOR_API`.
- `site/` — the **current live** hand-written site. Frozen: no edits until Phase 8 replaces it.
- `web/` — the Astro rebuild (arrives in Phase 2). `web/dist/` is **generated — never
  hand-edit, never commit**.
- Environments: one. Production, AWS account `486539985928`, `us-east-1`. No staging —
  in-progress work is served under the `preview/` S3 key prefix instead.
- DNS at Cloudflare: apex proxied with a 301 page rule, `www` **DNS-only (grey cloud)** so
  CloudFront is the only cache. Do not proxy `www`; that reintroduces a second cache layer
  nobody invalidates.
- Toolchain versions are pinned in `SPEC.md` — that table is the source of truth.

## Commands

```bash
# setup (from Phase 2)
cd web && npm ci

# build the site — MUST run before any terraform plan/apply, locally and in CI
cd web && npm run build            # emits web/dist/

# format / lint
terraform fmt -recursive
cd web && npm run lint

# local preview of the built site
cd web && npm run preview

# plan (repo root, after the build) — always with the second profile
AWS_PROFILE=second terraform init -input=false
terraform validate
AWS_PROFILE=second terraform plan -input=false

# security scan
checkov -d . --quiet --compact --framework terraform

# workflow lint
actionlint
```

**Account safety — read before running any AWS command here.** This laptop has two profiles
and the *default one is the wrong account*:

| Profile | Account | What it is |
|---|---|---|
| default | `348032171026` (`admin-gbngg`) | free-tier experiment account — **not** this project |
| `second` | `486539985928` (`admin`) | where the portfolio, its bucket, cert, domain and state live |

Every Terraform command in this repo must run with `AWS_PROFILE=second`, e.g.
`AWS_PROFILE=second terraform plan -input=false`. Confirm first with
`aws sts get-caller-identity --profile second`. Terraform also needs
`TF_VAR_ip_hash_secret` (or `terraform.tfvars`, which is gitignored).

## Working boundaries

- Branch first (`feat/<phase>`); **never commit directly to `main` or push to `main`**. An agent may merge a pull request through GitHub only after the human explicitly approves that specific PR for merge in the current session.
- One phase = one PR. If the diff cannot be reviewed in ten minutes, it was scoped wrong —
  split it before pushing, not after.
- Touch only what the phase requires. No drive-by refactors or reformats. Preserve
  unrelated working-tree changes.
- Never run `terraform apply` or `destroy`. Apply happens post-merge from `main` via
  `apply.yml`; merging requires explicit human approval for that specific PR in the current session.
- Never commit secrets, `*.tfvars`, `.env`, state files, `web/node_modules`, or `web/dist`.
- Ask before anything destructive, cost-bearing, or account-wide.
- Do not edit `site/` before Phase 8 — it is what the public currently sees.
- Commits: conventional style, author `arkhiVd`, **no AI attribution of any kind**.
- Blast radius: the live public site and its domain; the CloudFront distribution; the
  DynamoDB table holding real accumulated visitor counts (destroying it loses that data);
  the OIDC roles in `bootstrap/`, which every CI run depends on.

## Validation

- Run focused checks while working; run the full local gate before reporting done:
  `git diff --check` → `npm ci` → `npm run lint` → `npm run build` →
  `terraform fmt -check -recursive` → `terraform validate` → `checkov -d .` →
  `terraform plan` read line by line.
- **An implementation report is not evidence.** Paste real command output.
- Terraform: state creates / changes / **destroys / replaces** counts in the PR summary.
  An unexpected destroy is a stop-and-ask, not a detail.
- Visible changes: attach screenshots at 1280 and 375 px.
- Live checks must be cache-busted (`?z=$RANDOM`). Two CDN layers have lied here before.
  `curl -sI` should report `server: AmazonS3`.
- Accessibility and performance claims need pasted `axe` / `npx lighthouse` output.
- Independent review with **fresh context** is mandatory for every Standard and Risky
  phase. The session that wrote the code does not grade it.

## Documentation routing

- `SPEC.md` — requirements, pinned versions, acceptance criteria
- `ROADMAP.md` — phase order and exit criteria
- `TASKS.md` — current phase and validation status
- `DESIGN.md` — the visual contract; every UI diff is graded against it
- Vault knowledge layer: `~/Documents/myvault/Projects/portfolio.md`
- Workflow contract: `~/Documents/myvault/Systems/workflows/project-dev.md`

## Maintenance

Keep this file short enough to actually follow. Add a rule only when it prevents a real
repeat mistake; when corrected, tighten the existing rule rather than appending a warning.
Delete rules that turn out to be wrong.
