# portfolio-infra — tasks

## Current phase: 1 — mockup spike

- [ ] Choose the design by looking at it
  - Scope: two static HTML variants of home + the ClearSky case study under `mockups/a`
    and `mockups/b`, uploaded to the `preview/` key prefix; `local.mime_types` extended
    for the extensions the Astro build will emit.
  - Acceptance criteria: both variants reachable under `preview/`, reviewed at 1440 and
    375 px, one chosen (or both rejected), `DESIGN.md` frozen from the winner and the
    loser deleted.
  - Automated validation: `terraform fmt -check -recursive`, `terraform validate`,
    `terraform plan` in CI — creates only, zero destroys.
  - Manual validation: rendered at 1440 and 375 px in Chromium; diagram legibility and
    the eight-second test judged on a phone.
  - Blockers: none. Local plan runs with `AWS_PROFILE=second` (the default profile points
    at the free-tier account `348032171026`, not this one) and reports
    `Plan: 6 to add, 0 to change, 0 to destroy`.

## Completed phase: 0 — guardrails and design draft

- [x] Scaffold repo guardrails and the design contract
  - Scope: `AGENTS.md`, `CLAUDE.md`, `SPEC.md`, `ROADMAP.md`, `TASKS.md`,
    `DESIGN.md` (DRAFT), `.github/pull_request_template.md`. Docs only — no Terraform,
    no site, no workflow changes.
  - Acceptance criteria: pinned versions verified against upstream on the day of writing;
    no placeholder text anywhere; human approves `SPEC.md` and the `DESIGN.md` draft.
  - Automated validation: `git diff --check`, `terraform fmt -check -recursive`
    (unchanged files must still pass).
  - Manual validation: Aravind reads `SPEC.md` and `DESIGN.md` and accepts or amends them.
  - Blockers: none.

## Next phase preview (do not start before Phase 0 is approved)

Phase 1 — two static mockup variants (Console / Editorial dark) of home + one case study,
deployed under `preview/a/` and `preview/b/`, reviewed on desktop and phone, winner
freezes `DESIGN.md`, loser deleted.

## Open questions

Resolved 2026-07-31, recorded in `SPEC.md`: resume PDF committed at `web/public/resume.pdf`;
eight projects listed, five deep dives; home shows three featured cards; "open to work"
driven by one boolean in `web/src/config.ts`.

Still open:

- LinkedIn profile URL — needed for the contact block in Phase 4. Must come from Aravind;
  never guess a profile URL.
- Accent colour — deliberately not decided here. It is the variable the Phase 1 spike
  exists to settle (cyan in variant A, warm off-white/amber in variant B).

## Completed

Move a task here only after its acceptance criteria and validation passed. Record skipped
validation and residual risk rather than marking incomplete work done.
