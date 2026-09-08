# Portfolio tasks

## Current phase: 9, docs and content plan

Scope approved 2026-09-08. Keep the homepage recruiter-focused. Add Blog, curated
public Homelab and one Git-managed How I work section containing overview, AI workflow,
setup/tools and reusable skills. Implementation phases are in `ROADMAP.md`.

- [x] Fetch current `main` and branch as `feat/content-plan` from `80d0ae9`.
- [x] Preserve existing `.gitignore` and AGENTS edits and the local design skill.
  The pre-existing bootstrap edit is already in `main`; a named stash preserves its
  original patch. No bootstrap file changes belong to this phase.
- [x] Read-only Luna-low audit through Herdr; coordinator owns the document edits.
- [x] Reconcile deployment state, content boundaries, source layout and design hierarchy.
- [x] Pin Anthropic frontend-design with its license and provenance, project-local only.
- [x] Fresh-context Terra-low review through Herdr. Two findings addressed: clarify the
  nested-delegation prohibition and remove private operational-state details from this note.
  Reviewer confirmed both resolved on 2026-09-09, with no remaining actionable blocker
  in the docs-only diff. Baseline validation exceptions below remain open.
- [ ] Resolve validation exceptions before calling the phase ready to merge.
- [ ] Human review of the phase PR. Nothing committed, pushed or deployed this session.

## Deployed baseline, checked 2026-09-08

- [PR #18](https://github.com/arkhiVd/portfolio-infra/pull/18), Astro rebuild,
  merged 2026-08-22 at 19:04 UTC.
- [PR #24](https://github.com/arkhiVd/portfolio-infra/pull/24), response-header deployment
  permissions, merged 2026-08-22 at 19:10 UTC.
- [PR #25](https://github.com/arkhiVd/portfolio-infra/pull/25), dependency updates,
  merged 2026-08-22 at 19:21 UTC.
- [Production apply](https://github.com/arkhiVd/portfolio-infra/actions/runs/32593461504)
  for `80d0ae98c2592b428dad7ed8765edd3de84d8cdc`: completed, success.
- Live Astro home, Projects, About, six case studies, resume, sitemap and robots all
  returned 200 using cache-busted requests. Home reported `server: AmazonS3`;
  resume `application/pdf`, sitemap `application/xml`, robots `text/plain`.
- Current build contains 14 HTML pages, including five legacy redirects. The index
  lists eight projects, six with deep dives. `web/src/lib/site.ts` owns availability.
- Read-only Terraform plan after the pinned-Node build is empty: **0 add, 0 change,
  0 destroy, 0 replace**. This supersedes the old pre-cutover 19/14/7 plan.

Old reports of Lighthouse 100/100/96/100, axe and no-JS checks remain historical in
Git history. They are not fresh evidence for every live page. Do not mark all SPEC
acceptance criteria complete from a merged PR or a successful apply.

## Validation evidence for Phase 9

Run on 2026-09-08. Node 24.18.1 was downloaded to a temporary directory, verified
against upstream SHA-256 and used for `npm ci`, lint and build. No global runtime
configuration was changed.

```text
node-v24.18.1-linux-x64.tar.xz: OK
v24.18.1
npm ci: added 279 packages, audited 280 packages
npm audit: 2 high severity vulnerabilities
astro check, Result (24 files):
- 0 errors
- 0 warnings
- 0 hints
astro build: 14 page(s) built; Complete!
aws sts get-caller-identity --profile second, Account: 486539985928
AWS_PROFILE=second terraform fmt -check -recursive: exit 0
AWS_PROFILE=second terraform validate:
Success! The configuration is valid.
AWS_PROFILE=second terraform plan -input=false -no-color -detailed-exitcode: exit 0
No changes. Your infrastructure matches the configuration.
checkov -d . --quiet --compact --framework terraform: exit 1
Passed checks: 116, Failed checks: 30, Skipped checks: 0
```

The plan was read in full. Terraform, application source, dependencies and workflows
match `main`. No apply or resource mutation was performed.

Remaining validation work:
- [x] Final whitespace and scoped secret scans after review fixes on 2026-09-09.
  `git diff --check`: exit 0. `gitleaks dir` over the seven changed tracked files and
  three new skill files: exit 0, `no leaks found`. Local agent settings were not scanned
  or included. This is a working-file scan, not a replacement for PR history scanning.
- [x] Reviewer confirms both fixes on 2026-09-09. Result: "Both findings are resolved."
  No remaining actionable blocker in the docs-only diff.
- [ ] `actionlint` unavailable on PATH; workflows are unchanged, not newly validated.
- [ ] New CI run on a phase PR, not covered by the baseline production run.

No UI changed, so new screenshots, axe and Lighthouse runs are not part of this docs
phase. Phase 10 requires desktop/mobile mockups; later implementation phases require
fresh accessibility/performance evidence.

## Existing issues found during validation

These are not silently waived and are not fixes in this docs PR:

- `npm audit` flags `fast-uri` 3.0.0–3.1.5 and `nanoid` <3.3.18 at high severity.
  Fixes are available; inspect dependency paths and update in a separate dependency PR.
  Do not run `npm audit fix` as part of content planning. Open PR #26 proposes Astro
  7.2.9, but that alone is not evidence these advisories are fixed.
- Checkov reports 30 failed checks on unchanged Terraform, including IAM, logging,
  backup, encryption and CloudFront checks. Some suggest services outside the budget;
  triage them individually before changing infrastructure or accepting exceptions.
  CI currently marks Checkov advisory with `continue-on-error: true`.
- Build warns that the two `../fonts/*.woff2` references are resolved at runtime.
  Fonts exist in `web/public/fonts/`; verify their emitted CSS paths and live requests
  during the next UI gate. Do not describe this build as warning-free.

## Source inventory and author decisions

| Destination | Existing material | Still needed |
|---|---|---|
| First blog post | Portfolio case study and project note on the two-CDN cache incident | Author confirms topic, chronology and draft; no invented first-person claims |
| Homelab | Private atlas has Mermaid sources, verification tooling and HTML output | Reconcile relevant live drift, approve public service list, sanitize sources and exports |
| How I work overview/AI workflow | Actual project-dev contract and this bounded Herdr/Pi workflow | Author confirms current practice and approves a sanitized process diagram |
| Setup/tools | Existing environment provides candidates, not an approved inventory | Confirm what is current and worth publishing, with reasons and reviewed date |
| Reusable skills | Installed skills provide candidates with upstream sources | Select useful examples, verify ownership/licenses and safe installation instructions |

Reconcile live evidence privately before approving any public atlas derivative.
Record only reviewed, sanitized architecture here, not private operational state.

Next: close Phase 9's review/validation exceptions, then Phase 10 layout mockups.
Author approval of desktop/mobile navigation and content layouts precedes UI coding.
The first-post draft and public atlas/service list have their own publication approvals.
