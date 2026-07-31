# portfolio-infra — tasks

## Current phase: 0 — guardrails and design draft

- [ ] Scaffold repo guardrails and the design contract
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
