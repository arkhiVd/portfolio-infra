# portfolio-infra — tasks

## Current phase: 2 — Astro scaffold, design system, pipeline

- [ ] Ship the styled shell under `preview/`, built by CI
  - Scope: `web/` Astro project (7.1.6, Node 24.18.1); `tokens.css` implementing the frozen
    `DESIGN.md`; `Base.astro` with nav, footer, meta, skip link and the ocean layer;
    self-hosted Instrument Sans + JetBrains Mono variable woff2; `frontend.tf` uploading
    `web/dist` to `preview/` with cache-control split by asset type; `npm ci && npm run lint
    && npm run build` added to `plan.yml` and `apply.yml` **before** `terraform init`;
    `.nvmrc`; gitignore for build output. Phase 1 mockups deleted.
  - Acceptance criteria: `/preview/` serves the styled shell over CloudFront; no third-party
    origin is requested; plan shows creates only against the preview prefix and no change to
    root-served objects.
  - Automated validation: `npm ci`, `npm run lint` (astro check), `npm run build`,
    `terraform fmt -check -recursive`, `terraform validate`,
    `AWS_PROFILE=second terraform plan`.
  - Manual validation: built output served locally and rendered at 1440 and 375 px; emitted
    HTML grepped for external origins.
  - Blockers: none.

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
