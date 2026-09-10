# Portfolio roadmap

## Current direction

The Astro rebuild is deployed. PR #18 merged on 2026-08-22, followed by the
response-header IAM fix in #24 and dependency updates in #25. Historical phases 0–8
can be read in Git history; their unchecked boxes were not evidence of missing code.
Outstanding verification remains in `TASKS.md`.

The author approved the expansion on 2026-09-08. Preserve the recruiter-first home
and existing projects. Add Blog, curated public Homelab and one How I work section.
Its overview, AI workflow, setup/tools and reusable skills share one entry point.

One phase = one PR and a fresh review. No site changes in the planning PR. No merge,
apply or infrastructure redesign is authorized by approval of this roadmap.
There is no active hosted preview. Use local built-site previews and screenshots.

## Phase 9: reconcile state and plan the content expansion

**Class:** Standard. **Current phase.**

Scope:
- Start from fetched `main`, preserving existing working-tree edits and the design skill.
- Reconcile README, AGENTS, SPEC, ROADMAP, TASKS and conflicting design guidance.
- Record the content hierarchy, Git source model and public/private publication boundary.
- Inventory candidate source material and outstanding author decisions in TASKS.
- Use one small read-only audit and one fresh reviewer. Coordinator owns document edits;
  no competing writers, nested delegation or repeated full-context planning sessions.

Exit criteria:
- [x] Docs distinguish deployed code, historical evidence and unverified claims.
- [x] The approved hierarchy and Git/publication rules agree across the documents.
- [x] No application, infrastructure or dependency changes enter this phase.
- [x] Fresh-context review has no unresolved actionable findings.
- [x] Validation results and any blocked gates are recorded honestly.

Validation: `git diff --check`, source/config comparison, focused upstream/live checks,
full available local gate per AGENTS. Review Markdown links and skill provenance.
Rollback: revert this docs/skill PR; production assets are unchanged.

## Phase 10: content layouts and navigation review

**Class:** Standard. Depends on Phase 9.

Scope: local wireframes/mockups for homepage additions, blog index/article, Homelab
and How I work. Use actual candidate content rather than filler. Keep the current
fonts, ocean treatment and recruiter-first introduction. Compare compact navigation
options; do not squeeze every future destination into the current mobile pill.

Exit criteria:
- [ ] Author approves 1280 and 375 px layouts, navigation and reading measure.
- [ ] Projects/resume remain prominent; new material follows selected work.
- [ ] How I work uses internal section links, not separate Uses/Skills primary links.
- [ ] Decisions are recorded in DESIGN before production UI implementation.

Validation: screenshots, keyboard/no-JS navigation review, layout checks at 320 px.
No mockup is uploaded by Terraform. Any spike files stay outside `web/public/` and
production routes. Rollback: discard the mockup change; no production effect.

## Phase 11: blog foundation and one real post

**Class:** Standard. Depends on the layout decision.

Scope: Markdown collection/schema, blog index, article template, one author-approved
post, RSS, sitemap inclusion and links from home/navigation. Start without tag pages,
search, comments, newsletter service or client framework. Use `.html` routes compatible
with the current private S3 origin.

Candidate first post: the portfolio's two-CDN caching incident. The existing portfolio
case study and vault project note provide sources. The author must confirm the draft,
chronology and any first-person claims before publication; do not invent results.

Exit criteria:
- [ ] Article and metadata approved; links and factual claims trace to sources.
- [ ] Draft and invalid-metadata fixtures prove exclusion and schema enforcement.
- [ ] Feed validates and contains only published posts, with correct canonical links.
- [ ] New routes, sitemap and feed work from the built output without JavaScript.
- [ ] MIME map covers every new emitted extension; avoid `.md` downloads unless typed.
- [ ] Full local gate, independent review and UI acceptance evidence recorded.

Validation: clean install/lint/build, automated content/link/draft tests, feed XML check,
1280/375 screenshots, axe/no-JS/keyboard and Lighthouse checks, Terraform plan with
explicit add/change/destroy/replace counts. After human merge, verify live URLs and MIME.
Rollback: revert the phase PR; previous pages remain. Review expected object removals.

## Phase 12: curated public homelab overview and diagrams

**Class:** Standard unless access/IAM/networking changes are proposed, which are out of scope.
Depends on the content/layout foundation.

Scope: overview plus a small set of diagram views chosen after source review. Start
with system context and networking; add storage/backups or AI tooling only with verified
material. Version sanitized Mermaid sources and reviewed local SVGs or a pinned renderer.
Do not embed the raw private atlas HTML or expose live homelab endpoints.

Exit criteria:
- [ ] Inspect live topology and reconcile relevant private atlas drift without changing
      services or overwriting existing atlas work. Record source revision/review date privately.
- [ ] Author approves the public service list and publication boundary before export.
- [ ] Review source AND output for private identifiers, secrets and access details.
- [ ] Diagrams have captions, text equivalents and full-size local links; readable at 375 px.
- [ ] Site builds from a clean clone without the private atlas, SSH or local vault.
- [ ] Full local gate, fresh review and screenshots pass before human merge.

Validation: privacy checklist, source/export comparison or reproducible render check,
link/no-JS/accessibility tests, MIME check and full build/Terraform plan. A secret scan
alone is not privacy review. Rollback: revert and invalidate affected objects. Since Git
history is public, rollback cannot undo disclosure; stop before committing sensitive content.

## Phase 13: How I work

**Class:** Standard. Depends on the previous content phases.

Scope: one Markdown-backed page with overview, AI workflow, setup/tools and a small
selection of reusable skills. Link a source-controlled, sanitized process diagram.
Separate current reference material from dated blog accounts of changes.

Cover the real sequence: idea, context, planning, implementation, validation, independent
review and human deployment approval. Explain tool choices and failure modes. Avoid a
model-ranking scoreboard or undocumented claims about subscription savings.

Exit criteria:
- [ ] Author verifies current tools, hardware and workflow; page carries a reviewed date.
- [ ] No private configs, logs, sessions or personal paths are copied into public examples.
- [ ] Every selected skill has a purpose, example, source/license and adaptation notes;
      distribution/install commands are tested in a disposable directory where offered.
- [ ] Download MIME types and source references are correct. No fabricated skill ownership.
- [ ] One How I work entry point, with internal links and no empty subsections.
- [ ] Full local gate, fresh review and desktop/mobile acceptance checks pass.

Rollback: revert the phase PR and invalidate affected objects; disclosure has the same
public-history caveat as the atlas. Add child pages later only when content justifies them.

## Phase 14: final validation and merge preparation

**Class:** Standard. Depends on Phases 9–13. No production apply.

Scope: fix validation failures found by the complete built-site gate, update vulnerable
locked dependencies, preserve the approved ocean design at lower rendering cost, record
Checkov disposition and prepare the stacked PRs for final human approval.

Exit criteria:
- [x] Clean pinned-Node install, lint, content tests and production build pass.
- [x] Every non-redirect page passes local links, no-JS content, visible keyboard focus,
      axe, third-party-request and 320–2560 px overflow checks.
- [x] Every non-redirect page scores at least 95 in all four Lighthouse categories.
- [x] `npm audit` reports zero known vulnerabilities.
- [x] Terraform plan is read line by line with expected counts and no replacements.
- [x] Checkov findings are triaged without blanket suppression.
- [x] Fresh independent review has no unresolved actionable findings.
- [x] CI plan passed on PRs #27 and #29–#32; docs-only PR #28 reports no checks.
- [ ] Human gives final visual and merge approval.

Rollback: revert the final validation commit to restore the previous shader and dependency
lock. Content PR rollback is phase-by-phase in reverse order. No agent merges or applies.

## Phase 15a: local CMS foundation

**Class:** Standard. Stacked on Phase 14. No remote authentication or CloudFront policy.

Scope: vendor a pinned Sveltia bundle, add an inert production `/admin/` shell and a local
editor for existing Blog, Homelab and How I work Markdown. Preserve source schemas and the
Git/PR deployment boundary. Add YAML MIME handling, tests, provenance and authoring docs.

Exit criteria:
- [x] Local editor loads the repository config and all three existing content areas.
- [x] A disposable draft round-trip preserves frontmatter, Markdown, code fences and HTML.
- [x] Production admin shell makes no external request and states remote editing is disabled.
- [x] Normal pages load no CMS asset and retain existing browser/performance behavior.
- [x] Clean build, tests, security scans, Terraform plan and fresh review pass.

Rollback: remove `web/public/admin/`, its content test and YAML MIME entries. Content source
and all public routes remain unchanged.

## Phase 15b: content-source migration

**Class:** Standard. Depends on 15a.

Scope: move ordinary Home, About and Projects copy from TypeScript/Astro into validated
content files while retaining routes, ordering, facts, design and rendering. CMS forms edit
the resulting records. Do not migrate layout, operational settings, resume, diagram sources
or executable skill files.

Exit criteria: stable URLs and output inventory, one authoritative source per fact, schema
failure and ordering tests, visual equivalence, full local gate and fresh review.

Rollback: revert the migration commit to restore existing code-owned records.

## Phase 15c: remote CMS authentication and PR workflow

**Class:** Risky. Depends on 15a and 15b.

Scope: choose and verify the narrowest supported GitHub authentication design; prove Save
creates a content branch/PR rather than writing to `main`; isolate observed admin network
origins in an admin-only CSP. No AWS credentials, new AWS service, weakened branch
protection, automatic merge or public-site CSP expansion.

Exit criteria: permissions and secret storage documented, real draft PR round-trip tested,
admin network origins observed, Terraform has no unexpected replacement, full Risky gate
and fresh review pass. External OAuth infrastructure or cost needs separate human approval.

Rollback: remove remote bootstrap and admin CloudFront behavior/policy; local content files
and public rendering continue to work.

## Delegation budget

Use Pi through Herdr with the `openai-codex` subscription provider. Luna at low thinking
handles bounded inventory checks. Terra can handle normal implementation/review. Use Sol
or Astra only for a demonstrated blocker requiring deeper reasoning, not by default.
No automatic retries, nested delegation or idle polling loops. Each agent gets a narrow
file list, explicit read/write ownership and a concise result limit. One coordinator
maintains the phase record; a fresh reviewer checks the final diff.
