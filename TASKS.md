# Portfolio tasks

## Current phase: 15b, content-source migration

Phase 15a is draft PR #33, stacked on the still-unmerged expansion. Phase 15b moves ordinary
Home/About copy and all eight project-list records into validated content files. Six custom
case-study bodies stay in Astro for 15b2. Remote GitHub auth remains a separate Risky phase.

| Phase | Branch | Draft PR | State |
|---|---|---|---|
| 9, plan and reconciled docs | `feat/content-plan` | #27 | CI passed before later doc updates |
| 10, layout decision | `feat/content-layout` | #28 | CI passed before later screenshot refresh |
| 11, Markdown blog and RSS | `feat/content-blog` | #29 | CI passed before later shared changes |
| 12, curated Homelab | `feat/content-homelab` | #30 | CI passed |
| 13, How I work and public skill | `feat/content-workflow` | #31 | CI passed |
| 14, performance/security validation | `feat/content-validation` | #32 | CI and fresh review passed |

Final merge order is #27, #28, #29, #30, #31, then Phase 14. Each PR base must be moved
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
- [ ] Commit/push and open stacked draft PR.

## Phase 15b tasks

- [x] Home and About now load validated singleton JSON with no duplicate content arrays.
- [x] Eight project metadata records now have stable filename IDs and deterministic order.
- [x] Home Discover copy and project kicker/lede fields are CMS-editable.
- [x] Six detail routes preserve their custom Astro bodies and read shared metadata.
- [x] CMS blank optional values normalize safely; malformed IDs and metadata fail tests.
- [x] Astro check passed with 0 diagnostics; 8 tests passed; 18 pages built.
- [x] Public browser matrix and local/inert admin checks passed.
- [x] Full browser/security/Terraform gate and fresh review passed; rendered copy is unchanged.
- [ ] Commit, push and open the stacked draft PR.

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
