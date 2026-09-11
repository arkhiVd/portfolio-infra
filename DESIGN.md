# DESIGN.md — visual contract

**Status: production design retained; content hierarchy approved 2026-09-08.**
The author-approved 2026-08-22 exports informed the current Astro implementation.
`web/src/styles/tokens.css` and the shipped components are the available reference;
external design-tool files are not a clean-clone dependency. Preserve the spacious
deep-ocean layout, contained glass nav, credential artwork and simple contact panel.
The approved nebula WebGL layer is the single ambient-motion exception below.

## Thesis

Premium here is **information architecture, typographic discipline, and visible evidence** —
not effects. A recruiter gives the page about eight seconds, often on a phone. Those
seconds go to: what this person does → proof it is real → the work itself.

Two things this replaces, named so they do not come back:

- The **legacy site, replaced in August 2026,** spent the first screen on a typewriter animation and a `cd ~` nav.
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
| `--ink` | `#050507` | page background — stays black; the blue is light, not paint | — |
| `--surface` | `#0F1218` | cards, raised panels | structure, not text |
| `--hairline` | `rgba(255,255,255,.08)` | 1 px separators, card borders | — |
| `--text` | `#EDEDF0` | headings, body | **17.4:1** on ink |
| `--muted` | `#9B9BA3` | secondary copy, labels | **7.4:1** on ink · 6.8:1 on surface |
| `--accent` | `#4FC1D4` | links, active nav, metric emphasis, focus ring | **9.6:1** on ink |
| `--accent-dim` | `rgba(79,193,212,.14)` | chip fills, selection | — |

Rules: no pure black, no pure white. Never state information with colour alone — pair with
a label, an icon, or weight. Body text is never `--muted` at sizes below 15 px.

**Background — the ocean layer.** The page is black; deep-blue and teal light moves slowly
behind it. This is the site's one piece of ambient motion, and it is deliberate: it sets the
water register the iconography (containers, pipelines) will follow.

Structure — one fixed, non-interactive WebGL canvas reproduces the approved `Base.dc.html`
blue-green nebula shader exactly, followed by its subtle noise overlay and bottom fade. It
sits at `z-index: 0`; every content child sits at `z-index: 1`.

Rules that make it safe to ship:

- The shader is the one explicit exception to the no-canvas rule. It has no input or scroll
  coupling and draws one full-screen triangle with a low-complexity fragment shader.
- Its two time cycles are 40 and 12 seconds, matching the approved export.
- The bottom fade must preserve the blue-green upper glow while returning long pages to the
  black base.
- Content never sits directly on the glow: cards are `--surface`, the nav is glass, so text
  contrast never depends on where a blob happens to be.
- `prefers-reduced-motion: reduce` **freezes** the layer at a fixed opacity rather than
  hiding it — same picture, no movement.

Reference implementation: `web/src/components/Ocean.astro`, derived from the approved export.

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
- No gradients on text. No additional background animation beyond the approved ocean layer.

## Motion

- Single curve and duration: **`200ms cubic-bezier(.25,.1,.25,1)`**. Entrance animations
  may use 320 ms; nothing longer.
- Allowed: hover/focus colour and background transitions, one fade-and-rise entrance per
  section, nav collapse.
- **One exception, named:** the ocean background layer animates continuously (see Colour).
  Nothing else on the page may move on its own.
- Forbidden beyond the named background exception: parallax, additional canvas/WebGL,
  marquees, page transitions, tilt, typewriters, and motion attached to scroll position.
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

**Nav** — sticky shell with a compact monochrome cloud mark at left; availability and
`home / projects / about` sit right, with the links inside one contained glass pill. The same
cloud mark is the browser favicon. Visitor count belongs in the footer. Below 680 px the mark
stacks above a pill that retains all primary links.

**Hero** — the person's full name is the primary heading, followed by a quiet mono role,
one evidence-led paragraph, then two actions: a solid pill (`View projects`)
and a quiet mono link (`download resume →`). Contact remains in About and the footer.
Nothing else. Badge/chip rows were tried and cut: they read as generic template furniture,
and the facts they carried (cost, certifications, keyless CI) belong in About and the case
studies, where they can be argued instead of asserted.

**Project row** — the full Projects index uses project name (21 px), concise outcome
(`--muted`), stack line (mono, 13 px), status and arrow. Home's Selected work variant is
intentionally compact: name and arrow only. No highlighted metric or marketing tagline.
The whole row links to its case study. GitHub is a secondary action within that detail page;
only projects explicitly exempted from case studies may remain unlinked or link directly.

**Case-study section** — fixed order: Problem · Architecture · Decisions and tradeoffs ·
What broke and how it was fixed · Numbers. Each section led by a mono label at 13 px.
"What broke" is mandatory; a case study without a failure is a brochure.

**Figure** — diagrams full-width inside the content column, 12 px radius, hairline border,
mono caption below in `--muted`. Must stay legible at 375 px — re-export rather than shrink.

**Certification lockup** — issuer badge artwork, credential name and direct verification
link. Badge canvases are normalized to one size so different vendor artwork does not disrupt
the grid.

**Footer** — one restrained bordered surface panel with small mail, GitHub and LinkedIn
icons, followed by copyright and visitor count. No implementation tagline and no repeated
contact paragraph. The panel may echo the glass composition but does not add another
backdrop-filter layer.

**Visitor counter** — mono readout in the footer. Shows `····` until resolved, and keeps
showing `····` if the API fails. **Never renders a fabricated number.**

## Content rules

- The fold answers, in order: what he does → how to act on it → the work. No slogans above
  the fold, and no personality claims about 3am or boredom.
- The hero heading is the person's name, followed by the role. The introductory sentence
  names the discipline, not a vendor: "I build and operate cloud infrastructure."
  Vendors, services and versions belong in the supporting copy and case studies.
- **Cost language:** never publish "₹0", "zero cost", or "free" — it invites an argument
  about what is really free and reads as a gimmick. Say **"minimal running cost"**, or
  describe the engineering: no NAT gateway, no idle compute, torn down when not in use.
- Every number traces to a repo or a vault note; the PR that introduces a number lists its
  source. No rounded-up, unverifiable, or aspirational metrics — ever. Vanity counts stay
  out of the fold entirely (see "Proof chip").
- Project copy is written for an engineer on a panel: decisions, tradeoffs, failures, fixes.
- No sales language, no "passionate about", no buzzword lists posing as skills.

## Approved content hierarchy

Home remains recruiter-focused: identity, introduction, projects and resume come first.
Add links to real writing, the public homelab and How I work after selected work. Do not
replace the introduction with a personal dashboard or push the resume behind a menu.

Keep Projects and About. Add Blog, Homelab and **How I work** as content destinations.
How I work contains overview, AI workflow, setup/tools and reusable skills, initially
on one page with section anchors. Uses and Skills are not separate primary navigation links.
The current home/projects/about pill describes production, not the final expanded nav.
Approve desktop/mobile navigation mockups in Phase 10 before changing components.

Blog uses a reading layout with date, title, summary and restrained article typography.
Homelab uses captioned diagrams and explanations rather than an embedded dashboard.
How I work explains a real process and tool choices, with a reviewed date and source links.
No empty cards or future-page links. Preserve the existing palette and fonts unless the
author approves a change after seeing a mockup.

References inform different decisions: Davis for maintained personal reference pages,
DHH for dated writing, AI Hero for task-oriented skill explanations. Kannan's Vim
interaction is a personality reference, not permission to require commands for navigation.
The Anthropic frontend-design skill guides critique within this contract.

## Historical Phase 1 outcome

Both variants were built as real pages (home + the ClearSky case study) and rendered at
1440 and 375 px before the choice was made.

**A — Console (chosen).** Dense grid, mono section labels, three case cards with contained
architecture thumbnails, cyan accent. High signal per screen; the work is visible without
scrolling, and the layout still carries information at 1440 px instead of gutter.

**B — Editorial dark (rejected).** Larger display type, numbered index instead of cards,
full-bleed figure, warm accent, much more air. It read well as an essay but showed less
work per screen and left the right half of a 1440 px viewport empty until the reading
column was centred. Deleted in this phase; recoverable from git history if ever wanted.

Amendments made after the choice, on the author's call:

- ocean background adopted from the design exports and made *living*: black base with three
  slow-drifting blurred blobs under a vignette (see Colour). Static was tried first and
  rejected by the author — the wash has to move.
- "₹0/mo" language dropped everywhere in favour of "minimal running cost"
- the proof-chip row dropped entirely (generic); resource counts banned from the fold
- headline de-vendored: "cloud infrastructure", not "AWS infrastructure"
- headline plainer: "I build and operate cloud infrastructure."
- hero secondary action changed from email to resume download on 2026-08-22; recruiters get
  a take-away artifact while contact remains available in About and the footer
