# Portfolio tasks

## Current phase: 17, design tokens, phone nav and tap targets

Branch `feat/design-tokens-nav`. Standard: CSS, nav markup and the local browser gate.

- [x] Tokens: `--surface-2`, `--hairline-strong`, `--accent-strong`, `--live`, `--progress`,
      `--t-72`, `--hit`. Availability dot uses `--live`.
- [x] How I work: 19 `font-weight: 550` to 500 (the fonts ship 400 to 500, so no visual change);
      18 off-token greys to `--muted`; hero capped at 72 px.
- [x] Phone nav (below 680 px): one row with mark, availability and a `<details>` menu.
      Availability was hidden on phones before.
- [x] `.nav` now stacks above `main`. A broad `body > *` z-index rule had overridden it, which
      also disabled `position: sticky`. The nav stays non-sticky, as it has been live.
- [x] 44 px targets: brand mark, quiet links, section links, footer links, skip link, How I work
      section nav; citation chips on touch screens.
- [x] Browser gate resolves paths through `edge/clean-urls.js`, expects the `····` placeholder on
      noindex pages, and counts only rendered tab stops. Phase 16a and 16b had broken all three.

Local evidence, 2026-11-05:

```text
git diff --check: exit 0; astro check: 0 errors; node:test: 14 passed, 0 failed
browser gate (playwright 1.63.0, axe-core 4.13.0, /usr/bin/chromium), 14 pages:
  axe 0 violations; overflow none at 320/375/768/1280/2560; no-JS, keyboard focus, links PASS
  admin, counter stub and feed/sitemap XML PASS
  before this phase, How I work had 108 color-contrast nodes (#737681 on #050507 at 4.49:1)
terraform fmt/validate: ok
terraform plan: 2 add, 14 change, 2 destroy, 0 replace (the destroys are the two superseded
  hashed CSS bundles; the adds are their replacements)
```

Open, not in this phase:
- How I work has 54 font sizes under 12 px, down to 8 px. Needs its own type pass.
- Homelab Atlas rail links are 40 px; Phase F rebuilds that page.
- A sticky nav needs a background behind the mark and status first; author decision.

## Previous phase: 16b, clean links

Merged as PR #53 and applied 2026-11-05: 0 add, 21 change, 0 destroy. All 13 sitemap URLs return
200; canonical, RSS and redirects are clean; post-apply plan empty.

Branch `feat/clean-links`. Standard: templates and generated XML only, no infrastructure change.

- [x] `url()` returns extensionless page paths; file paths pass through.
- [x] Canonical URLs, sitemap `<loc>` and RSS `<link>` are extensionless; RSS `<guid>` keeps `.html`.
- [x] Legacy `*-detail` redirects and the one blog link point to clean paths.
- [x] Test: no built page links to an internal `.html` page or has a `.html` canonical.
- [x] Fresh-context review: approve. Noted, not fixed here: the link scan does not check absolute
      same-site URLs or `src=`; `/admin/` resolves only as `/admin/index.html` through CloudFront,
      as before 16a (the CMS is local-only).
- [x] After apply: live links, canonical tags, sitemap and feed URLs return 200.

## Previous phase: 16a, edge fixes for clean URLs, compression and 404

Merged as PR #52 and applied by CI on 2026-11-05: 2 added, 1 changed, 0 destroyed; post-apply plan
empty. Live: `/about`, `/blog/` and `/projects/clearsky` return 200; `/nope` returns the 404 page;
Brotli on HTML, CSS and JS (`mermaid.min.js` 3,565,102 to 1,059,631 bytes).

Branch `feat/edge-fixes`. Risky: changes the live CloudFront distribution and the CI apply role.

- [x] SPEC entry and rollback plan written first (`SPEC.md`, "Edge delivery").
- [x] `edge/clean-urls.js` viewer-request function with 14 passing unit tests in `npm run test`.
- [x] `compress = true`, function association, 403 and 404 error responses to `/404.html`.
- [x] `404.astro` with `noindex`; excluded from the sitemap.
- [x] Apply role granted CloudFront Function actions: `CreateFunction` on `*` (it has no resource
      type in the IAM service reference), the other five on the one function ARN.
- [x] `404.html` skips the visitor counter script; existing pages stay byte-identical.
- [x] `bootstrap/` applied 2026-11-05 as `admin` with the author's explicit approval, from a saved
      plan (0 add, 1 change, 0 destroy, additions only). Live `deploy` policy shows both
      statements; post-apply bootstrap plan is empty.
- [x] Fresh-context review round 1: approve; IAM `CreateFunction` scope, slash loop, counter
      on 404 and misplaced comment fixed.
- [x] Fresh-context review round 2: approve. Plan role `ReadOnlyAccess` v191 confirmed to grant
      `cloudfront:Describe*`, `Get*` and `List*`.
- [ ] Post-apply live checks from ROADMAP Phase 16a.

Local evidence, 2026-11-05:

```text
git diff --check: exit 0
npm ci: ok; astro check: 0 errors, 0 warnings, 0 hints
node:test: 14 passed, 0 failed
build: 19 pages; dist/404.html has <meta name="robots" content="noindex">
terraform fmt -check -recursive: exit 0; terraform validate: Success
checkov: 116 passed, 30 failed, 0 skipped (unchanged from the 2026-09-09 baseline)
terraform plan (root): 2 add, 1 change, 0 destroy, 0 replace
  + aws_cloudfront_function.clean_urls
  + aws_s3_object.portfolio_files["404.html"]
  ~ aws_cloudfront_distribution.portfolio_cdn: compress false -> true, function_association,
    two custom_error_response blocks
terraform plan (bootstrap): 0 add, 1 change, 0 destroy (apply_deploy policy, two statements)
```

Local Node was 26.13.0, not the pinned 24.18.1. CI runs the pinned version.

## Previous phase: 15c, remote CMS authentication and PR workflow

Phase 15c adds only the reviewed remote-auth code. The Worker and OAuth app are not live, and no
remote Save round-trip has been performed.

| Phase | Branch | Draft PR | State |
|---|---|---|---|
| 9, plan and reconciled docs | `feat/content-plan` | #27 | CI passed before later doc updates |
| 10, layout decision | `feat/content-layout` | #28 | CI passed before later screenshot refresh |
| 11, Markdown blog and RSS | `feat/content-blog` | #29 | CI passed before later shared changes |
| 12, curated Homelab | `feat/content-homelab` | #30 | CI passed |
| 13, How I work and public skill | `feat/content-workflow` | #31 | CI passed |
| 14, performance/security validation | `feat/content-validation` | #32 | CI and fresh review passed |
| 15a, local CMS foundation | `feat/cms-foundation` | #33 | CI and fresh review passed |
| 15b, page/project content model | `feat/cms-content-model` | #34 | local gate and fresh review passed |
| 15b2, case-study prose | `feat/cms-case-studies` | #35 | CI and fresh review passed |
| 15c, remote CMS auth | `feat/cms-remote-auth` | #36 | code-only CI/review passed; not deployed |

Final merge order is #27, #28, #29, #30, #31, #32, #33, #34, #35, then #36. Each PR base must be moved
to `main` after its parent merges, or the phases may be combined only with explicit human
approval. Agents do not merge or apply.

## What is built

- Schema-validated Markdown blog, one sourced article, file-style article routes and RSS.
- Draft/future content exclusion from routes, home, navigation, sitemap and feed.
- Curated Homelab page with editable Mermaid sources and reviewed local SVG exports.
- One How I work page containing overview, AI workflow, setup/tools and reusable skills.
- A source-controlled static-site review skill with MIT license and tested copy example.
- Wrapping six-link navigation and recruiter-first home Discover rows.
- `text/markdown; charset=utf-8` for downloadable Markdown skill files.
- Optional local browser gate in `tools/validate-browser.cjs`; tool setup is documented and
  remains outside production dependencies.

## Final local evidence, 2026-09-09

Pinned runtime: Node 24.18.1, downloaded to a temporary directory and checked against the
upstream SHA-256 file. The clean gate removed `web/node_modules`, `web/dist` and `.astro`
before starting.

```text
npm ci: found 0 vulnerabilities
astro check: 29 files, 0 errors, 0 warnings, 0 hints
node:test: 5 passed, 0 failed
production output: 18 HTML pages after fixture cleanup
actionlint 1.7.12: exit 0
git diff --check: exit 0
gitleaks origin/main..HEAD: 5 commits, no leaks found
npm audit: 0 total vulnerabilities
terraform fmt -check -recursive: exit 0
terraform validate: Success! The configuration is valid.
terraform plan -detailed-exitcode: 13 add, 10 change, 1 destroy, 0 replace
checkov: 116 passed, 30 failed, 0 skipped
```

The plan is cumulative against deployed `main`. All 24 actions are S3 object changes.
The expected destroy is `_astro/Base.DvNsJ3KF.css`, replaced by a newly hashed CSS object.
New objects are Blog/RSS pages, Homelab and How I work, three SVG diagrams, three public
skill files and hashed CSS. No bucket, CDN, Lambda, DynamoDB, IAM or state resource changes.
No apply was run.

Browser gate, all 13 non-redirect pages:

```text
axe-core 4.13.0: 0 WCAG 2 A/AA and 2.1 A/AA violations per page
horizontal overflow: none at 320, 375, 768, 1280 and 2560 px
no-JS main content and headings: PASS
keyboard walk and visible focus at every link: PASS
local links and same-page anchors: PASS
broken images: 0
third-party requests: 0
JavaScript errors: 0
visitor counter local success/failure stubs: PASS, not a live API check
RSS and sitemap DOMParser errors: 0
```

Lighthouse 13.4.1 ran against every non-redirect page in a local production build.
All 13 scored **100/100/100/100** for Performance, Accessibility, Best Practices and SEO.
The first article run scored 71 Performance with 2,950 ms total blocking time. Reducing
the existing ocean shader to a capped drawing buffer and 12 frames per second, with hidden
page pausing, produced 100 Performance and 0 ms blocking time. This is local evidence;
live CDN scores still require post-deploy checks.

Screenshots at 1280 and 375 px are under `docs/evidence/`. Initial reviews caught white
Mermaid backgrounds, unreadable labels and 320 px navigation overflow; all were fixed and
recaptured. `docs/evidence/browser-results.json` records the final page matrix.

## Security and residual risk

- Astro moved from 7.2.4 to 7.2.9 because 7.2.4 had a critical published advisory.
  Updated transitive packages include patched `fast-uri`, `nanoid`, `js-yaml`, `sharp`
  and `svgo`; the clean install and `npm audit` now report zero known vulnerabilities.
- Checkov remains advisory and reports 30 unchanged Terraform findings. Their disposition
  and separate Risky follow-ups are in `docs/checkov-triage.md`. No blanket suppression.
- Public Homelab content is a selected reference, not a full inventory. It includes no
  addresses, internal endpoints, account identifiers, filesystem paths, logs or service counts.
- Browser tests use a local visitor-counter stub and do not increment production counts.
- Monthly cost and live post-deploy behavior cannot be proven before deployment.

## Phase 15a tasks

- [x] Branch `feat/cms-foundation` from Phase 14 without merging the stack.
- [x] Verify and vendor Sveltia CMS 0.209.0 with SHA-256 and MIT license.
- [x] Add local-only admin shell/config for Blog and both reference pages.
- [x] Keep the production shell inert until remote auth receives Risky review.
- [x] Document public-draft, privacy, Git publication and removal boundaries.
- [x] Disposable CMS save preserved headings, links, inline code, fenced Bash/Mermaid,
      blockquote and inline figure HTML in Markdown source mode; fixture removed afterward.
      Cleared optional dates serialize as `updated: ''`, now normalized to undefined by schema.
- [x] Clean Node gate: 0 lint diagnostics, 6 tests passed, 18 pages built, npm audit 0.
- [x] Browser gate: 13 public pages unchanged; local CMS config loads with external requests
      blocked; simulated remote hostname loads no CMS/config; admin screenshots captured.
- [x] Gitleaks passed. One exact false-positive fingerprint in the checksum-pinned upstream
      bundle is documented in `SOURCE.md`; first-party files remain scanned.
- [x] Terraform fmt/validate passed. Cumulative plan: 18 add, 11 change, 1 hashed-CSS
      destroy, 0 replace. Phase 15a adds five S3 objects and updates `robots.txt` only.
- [x] Checkov baseline unchanged: 116 passed, 30 failed, 0 skipped.
- [x] Fresh Terra-medium review found three issues: public media staging, a weak optional-date
      assertion and missing local YAML MIME coverage. All fixed; re-review found no blocker.
- [x] Commit/push and open stacked draft PR #33.

## Phase 15b tasks

- [x] Home and About now load validated singleton JSON with no duplicate content arrays.
- [x] Eight project metadata records now have stable filename IDs and deterministic order.
- [x] Home Discover copy and project kicker/lede fields are CMS-editable.
- [x] Six detail routes preserve their custom Astro bodies and read shared metadata.
- [x] CMS blank optional values normalize safely; malformed IDs and metadata fail tests.
- [x] Astro check passed with 0 diagnostics; 8 tests passed; 18 pages built.
- [x] Public browser matrix and local/inert admin checks passed.
- [x] Full browser/security/Terraform gate and fresh review passed; rendered copy is unchanged.
- [x] Commit, push and open stacked draft PR #34.

## Phase 15b2 tasks

- [x] Move the six published case-study bodies into their existing project Markdown files.
- [x] Keep image paths, alt text and repository links in project metadata only; the adapter resolves figure markers at build time.
- [x] Keep `homelab-sync` and `net-automation` bodyless.
- [x] Add schema, route, source-safety and CMS-config tests for six stable IDs and routes.
- [x] `npm run lint` reported 0 diagnostics; `npm test` passed 9 tests; `npm run build` emitted 18 pages; `git diff --check` passed locally on 2026-09-11.
- [x] Parent/current text, DOM structure and main-region pixels match for all six routes at 375 and 1280 px.
- [x] Browser, audit, Gitleaks, actionlint, Terraform validation/plan and unchanged Checkov baseline passed.
- [x] Fresh Terra review found two parser-structure gaps; both were fixed and re-review found no findings.
- [x] Commit, push and open stacked draft PR #35; CI plan passed.

## Phase 15c tasks

- [x] Vendor the exact Sveltia CMS Authenticator Worker source and MIT license with checksum and behavior tests.
- [x] Create an isolated Wrangler project for `cms-auth.aravindakrishnan.cloud`; it serves the editor and trusts only its own origin.
- [x] Add a manual-dispatch-only Worker workflow using the `cms-auth` environment and named Cloudflare/OAuth secrets.
- [x] Enable Sveltia remote configuration with `public_repo` and `editorial_workflow`, while retaining local backend mode.
- [x] Keep the public `/admin/` shell inert on `www`; the remote editor uses a separate Worker origin and CSP. The public-site CSP is unchanged.
- [ ] Human creates the GitHub OAuth app with callback `https://cms-auth.aravindakrishnan.cloud/callback`.
- [ ] Enforce `main` protection for administrators and confirm the OAuth identity has no bypass. Current live evidence has required PR/`plan`, no force push/deletion, but `enforce_admins` is false.
- [ ] Human creates a main-only, reviewer-gated `cms-auth` environment, adds the four named secrets, and runs the Worker workflow.
- [ ] Human merges and deploys the site, then proves Save creates an editorial branch and PR without writing to `main`.
- [x] Code-only gate passed: web lint 0, web 9 tests, Worker 5 tests, both audits 0, 18-page build, Wrangler 4.131.0 dry-run, browser matrix, actionlint, Gitleaks and Terraform validation.
- [x] Plan: 19 add, 11 change, 1 obsolete hashed-CSS destroy, 0 replace. Checkov remains 116 passed and 30 failed.
- [x] Fresh Sol Risky review found six issues. Scope enforcement, separate-origin hosting, Worker hardening, workflow controls, rollback and extensionless asset handling were fixed; final re-review found no findings.
- [x] Commit and open stacked draft PR #36; GitHub Actions plan passed.
- [ ] Live activation and deployment-dependent checks remain blocked on the three human prerequisites above.

### Phase 15c handoff

Next session must start on `feat/cms-remote-auth` and inspect PR #36 before changing code. The
owner's next action is to enable administrator enforcement on `main`; prerequisite: confirm the
existing required `plan` check will not lock out merges. Then the owner creates the OAuth app and
the main-only, reviewer-gated `cms-auth` environment described in `docs/content-editing.md`.
Agents must not merge, deploy the Worker, apply Terraform, create secrets or run a live CMS Save
without fresh explicit approval. The live Save/direct-main rejection and authenticated CSP capture
remain unproven.

## Phase 14 approval gates

- [x] Fresh-context Sol-medium review against `origin/main..HEAD`: three findings fixed;
      reviewer confirmed no unresolved actionable blocker.
- [x] Phase 14 committed, pushed and opened as draft PR #32.
- [x] CI plan passed on PRs #27 and #29–#32; docs-only #28 has no reported check.
- [ ] Human reviews screenshots, article, Homelab boundary, How I work and plan counts.
- [ ] Human explicitly approves merge order. Agent still does not merge.
- [ ] After human merge/deployment: cache-busted live click-through, real visitor success
      and blocked-API placeholder, response headers, MIME checks, Lighthouse and empty plan.
- [ ] Cost Explorer check after one full month.
