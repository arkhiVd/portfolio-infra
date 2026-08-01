# portfolio-infra — tasks

## Current phase: 3 — home and projects index

- [ ] The two pages a recruiter lands on
  - Scope: `projects.ts` as the single project set; `CaseCard.astro`; home with three
    featured cards; `/projects` split into "with architecture" and "also built";
    `VisitorCount.astro` wired to `window.VISITOR_API`.
  - Acceptance criteria: both pages render at 1440 and 375; every number sourced; the
    counter shows a real count when the API answers and keeps its placeholder when it does
    not; pages readable with JavaScript disabled.
  - Automated validation: `npm run lint` (astro check), `npm run build`,
    `AWS_PROFILE=second terraform plan`.
  - Manual validation: rendered locally; counter proven against a stubbed API in both the
    success and failure paths.
  - Blockers: `/about` is linked from the nav and does not exist until Phase 4.

## Completed phase: 2 — Astro scaffold, design system, pipeline

- [x] 2026-08-01 Astro 7.1.6 on Node 24.18.1 building to `web/dist`, uploaded to `preview/`;
  shared `Base.astro`; self-hosted variable woff2; build wired into both workflows before
  Terraform — validated by `astro check` (0 errors), `npm run build`, and
  `terraform plan` (4 to add, 0 to change, 0 to destroy) (PR #17)

## Completed phase: 1 — mockup spike

- [x] 2026-08-01 Two variants built and rendered; **A (console grid) chosen**, `DESIGN.md`
  frozen from it with the deep-ocean background, vendor-neutral headline and the chip row
  cut; variant B deleted — validated by `terraform plan` (3 to add, 0 to change, 0 to
  destroy) and side-by-side renders at 1440 and 375 px (PR #16)

## Next phase preview

Phase 3 — home and projects index: hero, `CaseCard` component, the selected-work section
and the projects index, with the visitor counter wired to `window.VISITOR_API`.

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
