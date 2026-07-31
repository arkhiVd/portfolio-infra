# DESIGN.md — visual contract

**Status: DRAFT.** Frozen in Phase 1 from whichever mockup variant wins. Until then,
values here are proposals. After the freeze, every UI diff is graded against this file;
if a request conflicts with it, flag the conflict and propose the complying alternative
before building.

## Thesis

Premium here is **information architecture, typographic discipline, and visible evidence** —
not effects. A recruiter gives the page about eight seconds, often on a phone. Those
seconds go to: what this person does → proof it is real → the work itself.

Two things this replaces, named so they do not come back:

- The **live site** spends the first screen on a typewriter animation and a `cd ~` nav.
  It reads as a hobby terminal theme, and the fold carries no evidence.
- The **design-tool exports** spend it on a slogan. Typography improved, but the hero
  proves nothing, gutters eat 1440 px of width, the About page's first screen carries
  ~40 words, and certifications are raw vendor PNGs (a blue hexagon next to a glossy white
  circle) that clash on near-black.

## Principles

1. **Evidence over adjectives.** Every claim is a number, an artifact, or a link.
2. **One accent.** Colour is a pointer, not decoration. If everything is highlighted,
   nothing is.
3. **Mono is a label typeface.** Metrics, paths, commands, timestamps, section labels.
   Never body copy — that is what made the old site feel like a costume.
4. **Density with air.** Wide screens must carry information, not gutter. Air belongs
   between sections, not inside them.
5. **Motion is feedback.** Hover, focus, one entrance per section. Nothing that moves on
   its own while being read.
6. **It must survive a phone, a keyboard, and JS being off.**

## Colour

Dark, near-black base. Ratios below are computed against the WCAG formula and must be
re-verified with a checker before the freeze.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--ink` | `#050507` | page background | — |
| `--surface` | `#111114` | cards, raised panels | 1.09:1 vs ink (structure, not text) |
| `--hairline` | `rgba(255,255,255,.08)` | 1 px separators, card borders | — |
| `--text` | `#EDEDF0` | headings, body | **17.4:1** on ink |
| `--muted` | `#9B9BA3` | secondary copy, labels | **7.4:1** on ink · 6.8:1 on surface |
| `--accent` | `#4FC1D4` | links, active nav, metric emphasis, focus ring | **9.6:1** on ink |
| `--accent-dim` | `rgba(79,193,212,.14)` | chip fills, selection | — |

Rules: no pure black, no pure white. Never state information with colour alone — pair with
a label, an icon, or weight. Body text is never `--muted` at sizes below 15 px.

## Type

- **Instrument Sans** — headings, body, UI. **JetBrains Mono** — labels, metrics, paths,
  commands only. Both self-hosted woff2, SIL OFL 1.1, `font-display: swap`, preloaded.
- Scale (px): `13 15 17 21 27 34 44 56`. Nothing between steps; nothing above 56.
- Weights: 400 body, 500 headings and emphasis. No 600+, no italics.
- Line height: 1.65 body · 1.35 sub-heads · 1.08 display.
- Letter spacing: `-0.02em` at 34+, `-0.015em` at 21–27, `0` body, `+0.02em` mono labels.
- Measure: body max **74ch**, display max **26ch**. Mono labels are uppercase-free —
  lowercase, letter-spaced.

## Layout

- Content max width **1400 px**; page padding `clamp(24px, 5vw, 72px)`.
- Spacing scale (px): `4 8 12 16 24 32 48 72`. Section rhythm: 72 between sections,
  32 within, 12 inside a component.
- Grid: 12 columns at ≥1024 px, 1 column below 680 px. Case cards 2-up at ≥900 px.
- Breakpoints: `680` (nav collapses), `900` (cards go 2-up), `1200` (full rhythm).
- No horizontal scroll at any width from 320 px to 2560 px.

## Shape, depth, borders

- Radii: `8px` (chips, small controls), `12px` (cards, panels), `999px` (pills, nav).
- Cards: `--surface` + 1 px `--hairline`. Elevation is a hairline and a background shift,
  not a drop shadow.
- Glass, reserved for the sticky nav only: `backdrop-filter: blur(22px) saturate(150%)`,
  `background: rgba(255,255,255,.045)`, 1 px hairline, inset top highlight
  `rgba(255,255,255,.09)`.
- No gradients on text. One static radial background wash on the page, no animation.

## Motion

- Single curve and duration: **`200ms cubic-bezier(.25,.1,.25,1)`**. Entrance animations
  may use 320 ms; nothing longer.
- Allowed: hover/focus colour and background transitions, one fade-and-rise entrance per
  section, nav collapse.
- Forbidden: parallax, autoplaying canvas, marquees, page transitions, tilt, typewriters.
- `@media (prefers-reduced-motion: reduce)` disables every transition and entrance —
  content must be fully visible with no animation at all.

## Focus and accessibility

- `:focus-visible` → 2 px `--accent` outline, 2 px offset, on **every** interactive
  element. Never `outline: none` without a replacement.
- Skip link as the first focusable element, visible on focus.
- Hit targets ≥44×44 px on touch.
- One `<h1>` per page; heading levels never skip. Every image has meaningful `alt`, or
  `alt=""` when decorative. Diagrams get a real caption, not just alt text.
- Icons that carry meaning need an accessible name; decorative SVG gets `aria-hidden="true"`.

## Components

**Nav** — sticky, glass pill. Brand (full name) left; `home / projects / about` in mono
right; visitor count as a quiet mono readout. Active item in `--text`, others `--muted`.
Collapses to a disclosure menu below 680 px. No "open to work" dot unless it is currently
true.

**Proof chip** — the fold's evidence row. Mono, 13 px, `--accent-dim` fill, 8 px radius,
`--text` value + `--muted` label. Three to five, never more. Each is a fact traceable to a
repo or a vault note. Example set: `live · aravindakrishnan.cloud`, `₹0/mo steady state`,
`34 Terraform resources`, `OIDC · zero stored keys`.

**Case card** — architecture thumbnail (16:9, real diagram, not a stock graphic) · project
name (21 px) · one-line outcome (`--muted`) · stack chips (mono, 13 px) · one hard number.
Whole card is one link; hover shifts background to `--surface` and reveals a `→`.

**Case-study section** — fixed order: Problem · Architecture · Decisions and tradeoffs ·
What broke and how it was fixed · Numbers. Each section led by a mono label at 13 px.
"What broke" is mandatory; a case study without a failure is a brochure.

**Figure** — diagrams full-width inside the content column, 12 px radius, hairline border,
mono caption below in `--muted`. Must stay legible at 375 px — re-export rather than shrink.

**Certification lockup** — uniform mono-line treatment: issuer, credential name, verify
link. Same size, same weight, same alignment for every certification. Vendor badge PNGs
are not used.

**Footer** — mono, `--muted`: email, GitHub, LinkedIn, "built with Terraform + Astro,
source on GitHub" linking to this repo. No social icon soup.

**Visitor counter** — mono readout in the nav. Shows `····` until resolved, and keeps
showing `····` if the API fails. **Never renders a fabricated number.**

## Content rules

- The fold answers, in order: what he does → proof → the work. No slogans above the fold.
- Every number traces to a repo or a vault note; the PR that introduces a number lists its
  source. No rounded-up, unverifiable, or aspirational metrics — ever.
- Project copy is written for an engineer on a panel: decisions, tradeoffs, failures, fixes.
- No sales language, no "passionate about", no buzzword lists posing as skills.

## Phase 1 spike — the two variants

Both are evidence-first dark and share the tokens above. They differ in structure so the
choice is meaningful:

**A — Console.** Denser grid, mono section labels, 2-up case cards with architecture
thumbnails, cyan accent, tighter spacing (32 between sections). Reads as an operator's
dashboard: high signal, low ornament.

**B — Editorial dark.** Larger display type (up to 56), numbered index list instead of a
card grid, one full-bleed architecture figure per case study, off-white/amber accent
instead of cyan, more air (72–96 between sections). Reads as a technical essay.

Judged on: the eight-second test on a phone, legibility of diagrams at 375 px, how well
each holds up at 1440 px without gutter waste, and which one the author is willing to
maintain.

## Open questions for the freeze

- **Accent** — stays cyan `#4FC1D4`, or moves to the warmer off-white/amber of variant B?
  This is the one thing the spike exists to settle; it is not decided in advance.

Settled 2026-07-31 (in `SPEC.md`): the nav carries an "open to work" indicator driven by a
single boolean in `web/src/config.ts`, to be switched off the day it stops being true; home
shows **three** featured case cards with the full index at `/projects/`.
