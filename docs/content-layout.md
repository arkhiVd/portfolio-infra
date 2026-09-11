# Phase 10 content layout

## Decision

Keep the current deep-ocean palette, Instrument Sans and JetBrains Mono roles, cloud mark, hero and recruiter-first order. Add `blog`, `homelab` and `how I work` after the existing selected-work section. The three destinations are a reading trail, not a dashboard.

### Compact navigation options

| Option | Desktop | Small screens | Decision |
|---|---|---|---|
| Overflow menu | Six links plus status | Menu button | Hides useful destinations and needs JS or a disclosure pattern. Reject. |
| Two-tier nav | Identity row, link row | Same two rows | Clear but spends vertical space at desktop. Reject. |
| Wrapping link pill | Six text links in one glass pill | Pill wraps into two calm rows | Keeps every destination visible and works without JS. Select. |

The selected pill uses `flex-wrap: wrap`, 44 px link targets and `justify-content: center` below 680 px. The availability status stays outside the pill and disappears below 680 px.

## Layout plan

- **Home:** existing hero, actions and selected work remain first. `Discover` follows selected work as three editorial link rows: Writing, Homelab and How I work. Each row names one useful destination and a concrete reason to open it.
- **Blog index:** a compact page heading, then dated article rows. No card grid.
- **Article:** 74ch reading column. Date and summary precede one h1; sections use the existing mono label treatment. The sample explains why `www` must stay DNS-only when CloudFront owns site caching.
- **Homelab:** a captioned conceptual network diagram plus plain-language boundaries. It is explicitly an overview, not a live inventory or operational claim.
- **How I work:** one page with anchors for overview, AI workflow, setup and skills. Explain review boundaries and source links where production copy has them. Do not make separate Uses or Skills primary-nav pages.

## Token reference

| Purpose | Existing token/value |
|---|---|
| Base / raised panel | `--ink #050507` / `--surface #0F1218` |
| Text / secondary | `--text #EDEDF0` / `--muted #9B9BA3` |
| Link, focus, active state | `--accent #4FC1D4` |
| Borders / selected fill | `--hairline rgba(255,255,255,.08)` / `--accent-dim rgba(79,193,212,.14)` |
| Type | Instrument Sans body and headings; JetBrains Mono labels and metadata |
| Width / padding | `--max 1400px`; `--pad clamp(24px,5vw,72px)` |
| Rhythm / shape | `4 8 12 16 24 32 48 72px`; `8px`, `12px`, `999px` radii |

## Responsive specification

| Viewport | Navigation | Content |
|---|---|---|
| 1280 px | Cloud mark left; status and one wrapping glass link pill right. Six links remain visible, one row if space permits. | 12-column container; hero and project rows retain current width. Discover rows use a 180 px label column and copy beside it. Reading text stays at 74ch. |
| 375 px | Mark above a full-width glass pill. Links wrap naturally, centered, with 44 px targets. Status hidden. | One column with 24 px gutters. Hero keeps current order. Discover rows stack label, title and copy. Diagram labels remain readable rather than shrinking. |
| 320 px | Same stacked navigation. Pill has 8 px internal padding and links may form three rows. | No negative horizontal margins; 24 px gutters. Long URLs and diagram captions use `overflow-wrap:anywhere`. Article text stays 17 px. |

## Exact implementation guide

1. Extend `Nav.astro` current-page union and add `blog`, `homelab`, `work` links after `about`. Keep the cloud SVG, skip link and semantic `<nav>`.
2. In `global.css`, replace the mobile `space-between` rule on `.nav-links` with wrapped, centered links; use `min-height:44px` and inline padding on each nav anchor. Keep glass exclusive to the nav.
3. Add home Discover markup after selected work and before About. Use bordered rows, not `.card`; each whole row links to an existing destination only when that page lands in the same change.
4. Add `blog.astro` and dated post pages with a shared reading layout. Use `time datetime`, one h1, a summary, and prose constrained by `--measure`.
5. Add `homelab.astro` with an inline semantic diagram or local SVG, a figcaption, and copy that identifies the diagram as conceptual. Do not publish host addresses, service credentials or a claimed complete inventory.
6. Add `how-i-work.astro` with in-page anchor links for overview, AI workflow, setup and skills. Use source links only after their targets are reviewed for public release.
7. Update sitemap and primary navigation only once every linked page exists. Preserve reduced-motion, focus-visible and 320 px overflow checks.

The HTML mockup is a content and layout spike, not production source. Coordinator
validation on 2026-09-09 found no horizontal overflow at 1280, 375 or 320 px with JS
disabled and reduced motion enabled. Full-page captures are in
`docs/evidence/layout-1280.png` and `docs/evidence/layout-375.png`. The author approved
continuing implementation with final visual/merge approval reserved for the completed PRs.
