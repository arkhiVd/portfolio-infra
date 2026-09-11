# portfolio-infra

Source and Terraform infrastructure for [www.aravindakrishnan.cloud](https://www.aravindakrishnan.cloud).
The Astro portfolio is live. The next work adds a blog, a curated homelab atlas and a
single "How I work" section while keeping the homepage recruiter-focused.

## Architecture

```text
web/ -> Astro build -> web/dist/ -> private S3 -> CloudFront -> browser
                                                              |
                                               Lambda Function URL -> DynamoDB
```

- `web/` contains the site source. `web/dist/` is generated and never committed.
- `frontend.tf` uploads the build at the site root, assigns MIME types and configures
  CloudFront, its security headers, S3 OAC and ACM.
- CloudFront uses a private S3 origin without extensionless rewrites. Subpages use
  `.html` URLs; `web/src/lib/site.ts` owns URL generation.
- Terraform renders `templates/visitorscript.js.tftpl` with the visitor API URL.
  The counter uses HMAC-pseudonymized IPs and DynamoDB, with no tracking cookies.
- DNS is at Cloudflare. The apex redirects to `www`; `www` is DNS-only so CloudFront
  is the only CDN cache.
- State lives in S3 with native lockfile locking. `bootstrap/` is a separate,
  admin-only substack with local state for the state bucket and OIDC roles.

The rebuild shipped through PR #18. PR #24 added deployment permissions for the
response-header policy; PR #25 updated dependencies. See `TASKS.md` for evidence
and remaining verification, rather than assuming all acceptance checks passed.

## Local development

Use Node **24.18.1** from `.nvmrc`. Installed dependencies are fixed by
`web/package-lock.json`; see `SPEC.md` for the toolchain record.

```bash
cd web
npm ci
npm run dev
# Before reviewing a change:
npm run lint
npm run build
npm run preview
```

Edit source under `web/`, not the removed legacy `site/` or generated `web/dist/`.
There is no deployed staging environment or active preview-prefix upload. Review
unfinished work locally. Publishing a preview would require a separately reviewed change.

## Content editing

Blog, Homelab, How I work and project metadata are Git-backed content. Home and About use
validated singleton JSON. The local browser editor is at
`http://localhost:4321/admin/index.html`; setup and publishing steps are in
[`docs/content-editing.md`](docs/content-editing.md). The six custom project case-study
bodies remain code-owned until their separate prose migration.

The editor changes source in the working tree. It never uploads to S3 and has no AWS
credentials. Commit edits on a feature branch, review the pull request, and merge only after
human approval. The existing main-branch workflow remains the only production publisher.
The deployed `/admin/` shell stays inert until remote GitHub authentication passes its own
security review.

## Terraform and deployment

Read `AGENTS.md` before using AWS. The default local AWS profile is the wrong account.
Use profile `second`, account `486539985928`, and never print secret values.

After building the site:

```bash
aws sts get-caller-identity --profile second
AWS_PROFILE=second terraform init -input=false
AWS_PROFILE=second terraform fmt -check -recursive
AWS_PROFILE=second terraform validate
AWS_PROFILE=second terraform plan -input=false
```

Terraform also needs `TF_VAR_ip_hash_secret` or the gitignored `terraform.tfvars`.
Never commit credentials, tfvars, state, plan artifacts or local agent settings.

Open a phase-sized PR from a feature branch. `plan.yml` uses the OIDC plan role to
build, validate, scan and post the Terraform plan. Checkov currently runs as an
advisory check with `continue-on-error: true`; a green workflow alone does not prove
that scan passed. Gitleaks and Dependabot are configured.

After human review and merge, `apply.yml` uses the separate OIDC apply role to build,
apply and invalidate CloudFront. Agents do not apply, destroy or merge. Do not rerun
bootstrap during content work.

## Content and planning

- `SPEC.md`: approved requirements, publication boundaries and acceptance criteria.
- `ROADMAP.md`: separate phases for planning, blog, public atlas and How I work.
- `TASKS.md`: current evidence, blockers and next actions.
- `DESIGN.md`: existing visual contract and the approved content hierarchy.

New public writing will live in Git-managed Markdown. Editable diagram sources and
reviewed skill examples will be versioned with it. Nothing automatically exports from
private vault notes, machine configs or the homelab. New content must not add AWS
services or increase the intended running-cost profile.
