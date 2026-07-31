## Problem

## Approach

<implementation and important decisions / deviations from ROADMAP.md>

## Automated validation

<exact commands run and their real output>

- [ ] `npm ci && npm run lint && npm run build` (from Phase 2 onward)
- [ ] `terraform fmt -check -recursive`, `terraform validate`
- [ ] `checkov -d .` reviewed
- [ ] CI green on the **latest** commit

## Plan / blast radius

<creates / changes / destroys / replaces counts, cost delta, rollback path>

- [ ] `terraform plan` read line by line
- [ ] No unexpected destroys or replacements
- [ ] Objects served at the site root are unchanged (until Phase 8)

## Manual testing

<what was checked, where, at which widths>

- [ ] Verified on the real domain with cache busting (`?z=$RANDOM`)
- [ ] Screenshots attached at 1280 and 375 px for visible changes
- [ ] Keyboard-only pass on changed pages
- [ ] Page still renders with JavaScript disabled

## Design conformance

- [ ] Diff complies with `DESIGN.md` (or the conflict is stated and justified below)
- [ ] Every number introduced is listed here with its source

## Review

- [ ] Independent review with fresh context complete
- [ ] Actionable threads resolved

## Docs

- [ ] `SPEC.md` / `ROADMAP.md` / `TASKS.md` updated in this PR
- [ ] `README.md` matches actual behavior

## Limitations and follow-up

<skipped validation, accepted exceptions, known limits — "None" if none>
