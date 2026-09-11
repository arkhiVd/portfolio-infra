# portfolio-infra — specification

## Current scope

The Astro rebuild is deployed at the root domain. PRs #18, #24 and #25 merged on
2026-08-22; deployment evidence is recorded in `TASKS.md`. The old `site/` source and
preview-prefix deployment are gone. Earlier rebuild decisions below are history,
not a description of unfinished production cutover.

The author approved the content expansion on 2026-09-08. Keep the homepage
recruiter-focused, with projects and resume first. Add Blog, curated public Homelab
and one **How I work** section beneath that introduction. Setup/tools and reusable
skills belong inside How I work, not separate top-level destinations.

## Original rebuild problem

The old frontend had eight hand-written HTML pages with duplicated navigation,
footer and head markup. A 36 KB stylesheet supplied the terminal/typewriter theme.
The rebuild addressed a distracting introduction, missing resume download, shallow
project descriptions, missing sharing/SEO metadata and third-party font/icon requests.

The v3 rebuild replaced that site layer. The content expansion keeps the AWS
architecture, domain and intended cost profile unchanged.

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
- Home leads with identity, discipline, evidence-led introduction, projects and resume.
  No proof-chip row. New sections follow the recruiter-focused introduction and selected work.
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
- Work-in-progress is reviewed locally and never linked from the live site. There is no
  active preview-prefix deployment. Drafts must be excluded from production output, feeds,
  sitemaps and navigation, not merely hidden with CSS. This is a public Git repository:
  committed drafts remain public on GitHub. Keep sensitive or unapproved private source
  material outside the repository. Draft-only assets must not enter `web/public/`, which
  Astro copies verbatim; test their exclusion too.

## Content expansion and Git publication contract

| Section | Content boundary |
|---|---|
| Projects | Existing case studies, decisions, failures and linked evidence |
| Blog | Dated experiments, lessons, opinions and change reports |
| Homelab | Curated architecture, service roles, diagrams and operational lessons |
| How I work | One entry point for overview, AI workflow, setup/tools and reusable skills |

How I work starts as one page with internal section links. Split out child pages only
when real content needs them; do not create separate top-level Uses or Skills pages.
Reference pages describe the current setup and carry a reviewed/updated date. Blog
posts describe a dated change and link to the reference rather than duplicating it.

Publication requirements:

- Use Astro content collections with schema-validated Markdown for new writing.
  Proposed source directories are `web/src/content/blog/`, `web/src/content/homelab/`
  and `web/src/content/how-i-work/`. Final schemas belong to each implementation phase.
- Blog metadata includes title, description, publication date, optional update date,
  tags and draft status. Reference content includes title, description, reviewed date
  and draft status. Stable filenames/slugs prevent URLs changing with title edits.
- Add a blog index, individual posts and an RSS feed. Keep articles readable without JS.
  No CMS, accounts, comments, email service or hosted search is needed.
- Version editable public diagram sources under `web/diagrams/`. Render them at build
  time using a pinned tool, or commit reviewed SVG exports alongside their source until
  that renderer exists. Never hand-edit `web/dist/`. Do not add a client-side Mermaid CDN.
- Diagram figures have captions, text explanations and a full-size local asset link.
  Break large maps into readable views instead of shrinking private topology onto a phone.
- Version selected distributable skill sources under `web/public/skills/` only after
  review. A public entry needs purpose, when to use it, an example, source/license,
  adaptation notes and tested installation instructions where applicable.
- The installed `.claude/skills/frontend-design/` is authoring tooling, not a public
  catalogue entry or a reason to publish all local skills.
- Public Markdown, examples and diagrams are the reviewed publication source in this
  repository. Private operational configs stay in their own repositories. There is no
  build-time dependency on the author's laptop, SSH, vault or homelab.
- No automatic vault export, dotfile sync, agent-session upload, live discovery endpoint
  or raw private-atlas copy. Review both source and output for secrets, private addresses,
  internal hostnames, account identifiers, filesystem paths and sensitive access details.
  Use role labels and sanitized examples instead. Public infrastructure diagrams must
  not expose homelab administration endpoints.
- Recheck the private atlas against live evidence before deriving a public diagram.
  A historical node count is not proof of current topology. Publish a reviewed date,
  not an unsupported claim that the page is a live dashboard.
- Git changes use small PRs, source diffs and preview screenshots. Include any derived
  asset changes in the same PR as their source. Preserve attribution and licenses.
  No bulk repository export, Git submodule or symlink into private files.
- Add links only when their destination is complete. No empty catalogue, placeholder
  article, fabricated first-person experience or "coming soon" page ships.

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
- Checkov and gitleaks are wired in CI; Dependabot covers Actions and npm. Checkov is
  currently advisory via `continue-on-error: true`, so its findings need explicit review.
  CodeQL is not configured; changing scan policy is separate from this content phase.
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
| Astro | 7.2.9 resolved; package range `^7.2.9` | 2026-09-09, clean `npm ci`, audit, lint, tests and build |
| Node | 24.18.1 LTS (Krypton) — `.nvmrc` + CI | 2026-07-31 (nodejs.org/dist/index.json) |
| Fonts | Instrument Sans, JetBrains Mono — self-hosted woff2, SIL OFL 1.1 | 2026-07-31 |

Re-verify when a phase reopens. Do not take versions from memory. The table records
configured versions, not a claim that they are the latest. `npm ci` uses the lockfile;
`versions.tf` declares provider constraints and `.terraform.lock.hcl` fixes resolutions.
Node 24.18.1 remains configured in `.nvmrc` and both workflows. On 2026-09-08 its
Linux x64 archive passed upstream SHA-256 verification and ran the local install,
lint and build. The laptop's default Node may differ.
Astro 7.2.9 is included in the final validation phase because 7.2.4 had a published
critical advisory. The refreshed lockfile resolves the audited transitive dependencies.

## Cost and limits

- Budget: **₹0 delta.** Steady state must stay inside CloudFront's always-free tier
  (1 TB egress, 10 M requests/month), Lambda's 1 M requests/month, DynamoDB's 25 GB, and a
  few MB of S3. DNS stays at Cloudflare — no Route 53 hosted-zone fee.
- No new AWS service is allowed for the content expansion. New content adds S3 objects
  within the existing stack and budget; storage and requests are usage-billed. The
  response-header policy already exists and needs no recreation.
- Account context and known limits: vault `Projects/aws-free-plan-account-gotchas`.
  Note this is account `486539985928`, not the free-plan account.
- Teardown expectation: always-on. This is the public portfolio.

## Non-goals

- No CMS, comments, newsletter service, accounts or third-party search. A static blog
  and RSS feed are explicitly in scope.
- No React, Vue, or client-side router. JavaScript is limited to the visitor counter, the
  approved nebula background and its brief loading concealment; all content works without it.
- No analytics SaaS, no tag manager, no third-party embeds.
- No Route 53 migration, no DNS provider change, no new AWS account.
- No change to the visitor-counter Lambda, DynamoDB table, or its Terraform.
- No unrelated rewrite of existing project diagrams. Public homelab diagrams are new,
  curated derivatives that require live verification and publication review.
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

## Expansion acceptance criteria

Local gates completed on 2026-09-09. Deployment-dependent checks remain open:

- [x] Clean-clone build needs no private files, SSH connection or live homelab.
- [x] New Markdown metadata validates; malformed metadata fails the build.
- [x] Draft fixtures and source-only assets are absent from pages, RSS, sitemap and navigation.
- [x] Blog index and one author-approved, source-backed article build with a valid feed.
- [ ] Live production `.html` links, canonical URLs, feed links and sitemap resolve correctly.
      Local built-output checks pass.
- [x] Public atlas sources and exports passed privacy review; diagrams are legible at
      375 px, with captions, text explanations and full-size links.
- [x] How I work contains overview, AI workflow, setup/tools and selected skills within
      one section. Published factual claims have a source or author confirmation.
- [x] Homepage remains recruiter-focused; desktop and mobile layout approved before coding.
- [ ] Live post-deploy accessibility, no-JS, MIME, security headers and empty Terraform
      plan checks remain. Their local equivalents pass as recorded in `TASKS.md`.

## Historical rebuild decisions

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
