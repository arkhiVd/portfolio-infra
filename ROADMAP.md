# portfolio-infra — roadmap

Site rebuild v3. Status: **Phase 0 complete (PR #15) · Phase 1 in review.**

One phase = one PR = one review. The live site keeps serving from `site/` at the root
until Phase 8; everything before that lands under the `preview/` key prefix, so no phase
can degrade the published site.

## Phase 0 — guardrails and design draft

**Outcome:** the repo carries its own contract, and the design direction is written down
before any pixel is built.

**Included:** `AGENTS.md`, `CLAUDE.md`, `SPEC.md`, `ROADMAP.md`, `TASKS.md`,
`DESIGN.md` (DRAFT), `.github/pull_request_template.md`. No code, no Terraform changes.

**Dependencies and risks:** none — docs only. Risk is writing requirements nobody
approved, so the exit gate is human approval, not a green check.

**Exit criteria:**
- [ ] Pinned versions in `SPEC.md` verified against upstream on the day of writing
- [ ] Human approves `SPEC.md` and the `DESIGN.md` draft

**Validation:**
- Automated: `terraform fmt -check -recursive` (unchanged), `git diff --check`
- Manual: Aravind reads `SPEC.md` and `DESIGN.md` and says yes

## Phase 1 — mockup spike: choose the design for real

**Outcome:** the design is chosen by looking at it on a real screen and a real phone, not
by approving hex values in a document.

**Included:** two plain static HTML variants (no Astro yet) of *home + one case study*,
both evidence-first dark, deployed under `preview/a/` and `preview/b/`; the
`local.mime_types` extension needed to serve them; `DESIGN.md` frozen from the winner.

- **A — Console:** denser grid, mono labels, 2-up case cards with architecture thumbnails,
  cyan accent, tighter spacing scale.
- **B — Editorial dark:** larger type, numbered index instead of a card grid, full-bleed
  architecture figure, off-white/amber accent, more air.

**Dependencies and risks:** adds S3 objects under a new prefix — additive, no destroys.
Both variants may be rejected; a second spike is far cheaper than rebuilding eight pages.

**Exit criteria:**
- [ ] Both variants reachable at `https://www.aravindakrishnan.cloud/preview/{a,b}/`
- [ ] Reviewed on desktop **and** phone
- [ ] One variant chosen (or both rejected and re-spiked); `DESIGN.md` frozen from the winner
- [ ] Losing variant deleted in the same PR

**Validation:**
- Automated: `terraform fmt -check -recursive`, `terraform validate`, `terraform plan`
  (creates only, zero destroys, stated in the PR)
- Manual: both URLs opened at 1280 and 375 px, screenshots attached

## Phase 2 — Astro scaffold, design system, build pipeline

**Outcome:** a styled shell of the chosen design is live under `preview/`, built by CI.

**Included:** `web/` Astro project pinned per `SPEC.md`; `tokens.css` implementing the
frozen `DESIGN.md`; `Base.astro` (nav, footer, `<head>`, skip link); self-hosted
Instrument Sans + JetBrains Mono woff2; project icons from local SVG path data (replacing
the devicon CDN); `frontend.tf` uploading `web/dist` to `preview/`; `setup-node` +
`npm ci` + `npm run build` added to `plan.yml` and `apply.yml` **before** `terraform init`;
`.nvmrc`; `.gitignore` for `web/node_modules` and `web/dist`.

**Dependencies and risks:** Phase 1 frozen `DESIGN.md`. The real risk is the build/plan
ordering — if Terraform runs before the build, the plan is computed against absent output.
Second risk is `local.mime_types`: anything unmapped ships as `binary/octet-stream` and
fonts or `sitemap.xml` break silently.

**Exit criteria:**
- [ ] `/preview/` serves the styled shell over CloudFront
- [ ] `terraform plan` pasted in the PR with creates/changes/destroys counted and stated
- [ ] Zero change to objects served at the site root
- [ ] Fonts load from the site's own origin (verified in the network panel)

**Validation:**
- Automated: `npm ci`, `npm run build`, `terraform fmt/validate/plan`, `actionlint`
- Manual: `/preview/?z=$RANDOM` at 1280 and 375 px; network panel shows no third-party origin

## Phase 3 — home and projects index

**Outcome:** the two pages a recruiter actually lands on are done.

**Included:** hero, proof chips, `CaseCard` component, projects index (all featured
projects), visitor counter ported against `window.VISITOR_API`.

**Dependencies and risks:** Phase 2. Risk: unsourced numbers — every claim needs a source.

**Exit criteria:**
- [ ] Both pages live under `preview/`
- [ ] Visitor count increments on the preview URL
- [ ] Every number on the pages listed in the PR with its source
- [ ] Pages render with JavaScript disabled

**Validation:**
- Automated: build + plan
- Manual: screenshots at 1280 and 375 px; JS-disabled check; counter observed incrementing

## Phase 4 — about, resume, contact

**Outcome:** a recruiter can leave with the resume.

**Included:** about page (experience, certifications as uniform mono-line lockups, skills),
`resume.pdf` served from the site with a visible download CTA, contact block
(mailto + GitHub + LinkedIn, subject to the open question in `SPEC.md`).

**Dependencies and risks:** the LaTeX source lives outside this repo — the compiled
`web/public/resume.pdf` is committed here, so it is public and permanent in git history;
check its contents before committing. Needs the LinkedIn URL from Aravind (still open in
`SPEC.md`); `.pdf` must be added to `local.mime_types`.

**Exit criteria:**
- [ ] `curl -sI` on the resume URL returns `content-type: application/pdf`
- [ ] Download works from a phone browser
- [ ] Certification marks are drawn from one consistent visual system, not vendor PNGs

**Validation:**
- Automated: build + plan; mime map covers `.pdf`
- Manual: download on desktop and phone; screenshots

## Phase 5 — case-study template and first two deep dives

**Outcome:** the format that proves engineering judgment exists and is used twice.

**Included:** `CaseStudy.astro` — problem → architecture → decisions and tradeoffs → what
broke and how it was fixed → numbers; architecture diagrams as captioned figures.
First two: **ClearSky** and **Cloud Detective**.

**Dependencies and risks:** source material is in the vault (`Projects/*.md`) — link to
the repos, do not duplicate the vault into the site.

**Exit criteria:**
- [ ] Both pages live under `preview/`, each with at least one real failure-and-fix section
- [ ] Diagram figures legible at 375 px
- [ ] Numbers sourced in the PR

**Validation:**
- Automated: build + plan
- Manual: read end to end on a phone; screenshots

## Phase 6 — remaining deep dives

**Outcome:** the featured project set is complete.

**Included:** this portfolio rebuild (two-CDN cache trap, least-privilege IAM breaking
`terraform refresh`, the OIDC `sub`-format trap), AppStack, CDC pipeline. Split into two
PRs if the diff outgrows a ten-minute review.

**Exit criteria:**
- [ ] Each featured project either has a deep dive or is deliberately listed without one
- [ ] No placeholder or "coming soon" content ships

**Validation:** build + plan; read-through; screenshots.

## Phase 7 — performance, accessibility, SEO gates

**Outcome:** the quality bar is enforced by checks, not hope.

**Included:** per-page OG and Twitter meta, `sitemap.xml`, `robots.txt`, JSON-LD `Person`,
and a CloudFront `aws_cloudfront_response_headers_policy` (HSTS, CSP,
X-Content-Type-Options, Referrer-Policy). `gitleaks` and Dependabot added to CI.

**Dependencies and risks:** **Risky — a wrong CSP silently breaks the site.** Write the
policy against the actual asset inventory, verify on `preview/` with a clean console
*before* attaching it to the default cache behavior. Rollback: detach the policy, re-apply.

**Exit criteria:**
- [ ] Lighthouse ≥95 mobile on all four categories, raw output pasted in the PR
- [ ] Zero console errors on every page with the policy attached
- [ ] `axe` scan clean; keyboard walk-through recorded
- [ ] Social preview verified by rendering the OG image and tags

**Validation:**
- Automated: `npx lighthouse`, `axe`, build + plan, `actionlint`
- Manual: console check per page on the real domain, social-card preview

## Phase 8 — cutover

**Outcome:** the new site serves the root; the old one is gone.

**Included:** Astro `base` → `/`; `frontend.tf` uploads `web/dist` at the root and drops
the `site/` upload; legacy `site/` deleted; full `/*` CloudFront invalidation.

**Dependencies and risks:** **Risky — this deletes S3 objects and changes what the domain
serves.** Rollback: revert the PR; the old `site/` returns from git history and re-applies.

**Exit criteria:**
- [ ] `terraform plan` read line by line; destroy count expected and stated in the PR
- [ ] Live domain verified cache-busted (`?z=$RANDOM`) at 1280 and 375 px
- [ ] `terraform plan` empty after apply
- [ ] `preview/` prefix removed or clearly stale-marked
- [ ] Vault `Projects/portfolio.md`, `Tracker/log/`, and resume bullets updated

**Validation:**
- Automated: `terraform plan -detailed-exitcode`, Lighthouse re-run on the root domain
- Manual: full click-through of every page and link on the live domain, from a phone and a
  desktop, with cache busting; `curl -sI` confirms `server: AmazonS3` (Cloudflare stays out
  of the `www` path)
