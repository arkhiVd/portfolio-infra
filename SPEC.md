# portfolio-infra — specification

## Problem

The infrastructure behind `www.aravindakrishnan.cloud` is sound; the site it serves is
not hiring-grade. The current front end is eight hand-written HTML pages that each carry
their own copy of the nav, footer and `<head>`, styled by a single 36 KB `styles.css` in
a terminal/typewriter theme. Concretely, it costs opportunities because:

- the first screen sells an animation, not evidence — no numbers, no architecture, no proof
- there is no resume anywhere on the site; a recruiter leaves with nothing to take away
- project pages describe *what was built*, not the decisions, failures and fixes that
  demonstrate engineering judgment
- no per-page OG/Twitter meta, no sitemap, no structured data — links preview as bare URLs
- fonts and icons load from Google Fonts and jsDelivr, adding third-party round-trips
- every nav/footer change means editing eight files, so the site rots between edits

This spec covers **v3**: a complete rebuild of the site layer. The AWS architecture,
domain, and cost profile stay exactly as they are.

## Users

- **Recruiters and hiring managers** — skim on the order of eight seconds, often on a
  phone, frequently from a LinkedIn or resume link. They need to know what the person
  does, what they have actually shipped, and how to get the resume, without scrolling.
- **Engineers on an interview panel** — arrive with more time and read one case study end
  to end. They are looking for tradeoffs, failure analysis, and whether the numbers hold up.
- **The author (Aravind)** — maintains it solo, part-time, alongside a CKA sprint and a
  job hunt. Maintenance cost is a first-class requirement, not an afterthought.

## Required behavior

- Static site served from CloudFront over the existing custom domain, HTTPS only.
- Home, Projects index, About, and one deep-dive page per featured project.
- Above the fold on home: what the person does, a row of proof points, and real work.
- Every page reachable and readable with JavaScript disabled; JS is enhancement only.
- Visitor counter renders a live count; when the API is unreachable it renders a neutral
  placeholder and never a fabricated number.
- `resume.pdf` downloadable from the site with correct `Content-Type`. The PDF is
  **committed to this repo** (`web/public/resume.pdf`) and refreshed by hand from the LaTeX
  source in `~/Documents/resume/` — that source stays out of this repo, so a resume change
  is a deliberate commit here, not an invisible CI side effect.
- Full keyboard operability: visible focus on every interactive element, working skip link.
- `prefers-reduced-motion: reduce` disables all non-essential motion.
- Responsive from 320 px to 2560 px with no horizontal scroll at any width.
- Work-in-progress is served under the `preview/` key prefix and is never linked from the
  live site, so the published site never shows a half-built page.

## Architecture and data flow

Unchanged from v2 (see `README.md`), with one addition — the site is now built:

```
web/ (Astro, source)  --npm run build-->  web/dist/  --aws_s3_object-->  S3 (private)
                                                                          |  OAC
                                                              CloudFront (PriceClass_100)
                                                                          |
                                             browser  --POST-->  Lambda Function URL --> DynamoDB
```

- `web/` — Astro project. `src/layouts/Base.astro` owns nav, footer, `<head>`, meta;
  pages import it. `src/styles/tokens.css` is the machine-readable half of `DESIGN.md`.
- `web/dist/` — **generated, never hand-edited, never committed** (gitignored).
- `frontend.tf` — uploads the built output with `aws_s3_object` + `fileset`, content type
  from `local.mime_types`. **The build must run before `terraform plan`/`apply`**, locally
  and in CI, or Terraform plans against stale or absent output.
- `templates/visitorscript.js.tftpl` → `assets/js/visitorscript.js` — rendered by Terraform
  so the Lambda Function URL is never hand-copied. Unchanged; the site loads it as an
  external script and reads `window.VISITOR_API`.
- State: S3 backend with native lockfile locking. Environments: one — production,
  account `486539985928`, `us-east-1`.

## Security and privacy

- S3 bucket private, public access blocked, reachable only via CloudFront OAC.
- No stored AWS keys anywhere. CI assumes scoped roles by GitHub OIDC: `portfolio-ci-plan`
  (read-only, trust `pull_request`) and `portfolio-ci-apply` (least-privilege writes,
  trust `refs/heads/main`).
- Visitor counter pseudonymizes client IPs with an HMAC (`ip_hash_secret`, never committed;
  supplied as `TF_VAR_ip_hash_secret` from a GitHub secret). No cookies, no analytics SaaS,
  no third-party tracking on the site.
- Fonts and icons self-hosted — no third-party origin receives visitor requests.
- Required scans: `checkov` on Terraform in CI (already wired), `gitleaks` in CI (to add),
  Dependabot for Actions and npm (to add), CodeQL is not applicable to a static site.
- Never commit: `*.tfvars`, `.env`, state files, `web/node_modules`, `web/dist`.
- `web/public/resume.pdf` is committed and therefore **public and permanent** — it is in a
  public repo, in git history, and served on the open internet. Before each refresh, confirm
  it carries only what is meant to be public (no home address, no personal phone number if
  that is not intended). Removing a later version does not remove it from history.

## Pinned versions

| Thing | Version | Verified on |
|---|---|---|
| Terraform (CI) | 1.15.2 | 2026-07-31 |
| Terraform (required_version) | >= 1.10.0 | 2026-07-31 |
| AWS provider | ~> 6.0 | 2026-07-31 |
| archive provider | ~> 2.0 | 2026-07-31 |
| Astro | 7.1.6 | 2026-07-31 (`npm view astro version`) |
| Node | 24.18.1 LTS (Krypton) — `.nvmrc` + CI | 2026-07-31 (nodejs.org/dist/index.json) |
| Fonts | Instrument Sans, JetBrains Mono — self-hosted woff2, SIL OFL 1.1 | 2026-07-31 |

Re-verify when a phase reopens. Do not take versions from memory.

## Cost and limits

- Budget: **₹0 delta.** Steady state must stay inside CloudFront's always-free tier
  (1 TB egress, 10 M requests/month), Lambda's 1 M requests/month, DynamoDB's 25 GB, and a
  few MB of S3. DNS stays at Cloudflare — no Route 53 hosted-zone fee.
- No new AWS service may be introduced by this rebuild. The only Terraform resources added
  are `aws_s3_object`s and (in P7) one `aws_cloudfront_response_headers_policy` — both free.
- Account context and known limits: vault `Projects/aws-free-plan-account-gotchas`.
  Note this is account `486539985928`, not the free-plan account.
- Teardown expectation: always-on. This is the public portfolio.

## Non-goals

- No CMS, no blog, no comments, no newsletter.
- No React, Vue, or client-side router. JavaScript is limited to the visitor counter, the
  approved nebula background and its brief loading concealment; all content works without it.
- No analytics SaaS, no tag manager, no third-party embeds.
- No Route 53 migration, no DNS provider change, no new AWS account.
- No change to the visitor-counter Lambda, DynamoDB table, or its Terraform.
- No redesign of the architecture diagrams' underlying content (they are accurate; they
  may be re-exported for legibility).
- No dark/light theme toggle — one direction, executed well.

## Acceptance criteria

- [ ] `cd web && npm ci && npm run build` succeeds from a clean clone — proven by the CI log
- [ ] `terraform plan` after apply is empty — proven by `terraform plan -detailed-exitcode`
- [ ] Every page scores **≥95 on mobile** for Performance, Accessibility, Best Practices and
      SEO — proven by pasted `npx lighthouse` output, not by assertion
- [ ] No network request to a third-party origin on any page — proven by DevTools network
      panel screenshot with a domain filter
- [ ] Site is fully operable by keyboard and every interactive element shows a visible focus
      ring — proven by a recorded tab walk-through; `axe` scan reports zero violations
- [ ] Every page renders its content with JavaScript disabled — proven by manual check
- [ ] `resume.pdf` downloads over the custom domain with `content-type: application/pdf` —
      proven by `curl -sI`
- [ ] Visitor count renders a real number on the live domain, and renders a neutral
      placeholder (never a fake number) when the API is blocked — proven by both screenshots
- [ ] No horizontal scroll at 320, 375, 768, 1280, 2560 px — proven by screenshots
- [ ] Every numeric claim on the site traces to a repo or a vault note — proven by a
      source list in the PR that introduces the claim
- [ ] Monthly AWS cost unchanged — proven by Cost Explorer one full month after cutover
- [ ] No secrets in the diff — proven by `gitleaks` in CI

## Unresolved questions

Resolved 2026-07-31 (decisions, not guesses — change them here, not in a page):

- **Resume delivery:** committed at `web/public/resume.pdf`, refreshed by hand from
  `~/Documents/resume/`. See "Required behavior" and the public-permanence warning above.
- **Featured set:** the Projects index lists all eight (ClearSky, Cloud Detective, AppStack,
  CDC pipeline, this portfolio, CI/CD for AWS containers, self-hosted encrypted sync,
  network automation scripts). **Six get deep dives** — ClearSky, Cloud Detective,
  AppStack, CDC pipeline, this portfolio and CI/CD for AWS containers. The remaining two
  are listed without links to pages that do not exist.
- **Home:** three compact featured rows, not the full index. The index lives at `/projects.html`.
- **"Open to work" indicator:** shown, driven by a single boolean in one config module
  (`web/src/lib/site.ts`) so switching it off is a one-line commit. It must be turned off the
  day it stops being true — a stale indicator is worse than none.

Resolved 2026-08-01:

- **LinkedIn:** `https://linkedin.com/in/aravindakrishnan-v-2b0651218`, taken from Aravind's
  own `resume.tex` header rather than guessed. Published in the About contact block.

Resolved 2026-08-01 (continued):

- **Resume PDF: published, redacted.** `web/public/resume.pdf` is a build of `resume.tex`
  with **only** the personal phone number removed from the header — email, location,
  portfolio, LinkedIn and GitHub all stay. Verified by decompressing the PDF's FlateDecode
  streams and searching for the digits, the spaced form, the country code, and a kerned
  digit run; all absent, while the name, email, LinkedIn and employer are present.

  To refresh it (there is no LaTeX toolchain on the laptop; this builds one in a container):

  ```bash
  mkdir -p /tmp/resume-build && cp ~/Documents/resume/resume.tex /tmp/resume-build/
  # delete only the "+91 ..." fragment from the header line, keep everything else
  cd /tmp/resume-build
  printf 'FROM debian:stable-slim\nRUN apt-get update && apt-get install -y --no-install-recommends \\\n  texlive-latex-base texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended\n' > Dockerfile
  docker build -t resume-latex:local .
  docker run --rm -v "$PWD":/w -w /w resume-latex:local pdflatex -interaction=nonstopmode -halt-on-error resume.tex
  # VERIFY the phone is absent from the binary before copying it into web/public/
  ```

  `~/Documents/resume/resume.tex` stays the canonical resume, phone number included — the
  redaction applies only to the copy published on the web.

- **Employer is Zarthi.** Confirmed by Aravind 2026-08-01. The v2 site said Centilytics;
  that was wrong and does not carry over. `web/src/lib/about.ts` exports `employer` and both
  the home page and About read from it, so the name exists in exactly one place.
