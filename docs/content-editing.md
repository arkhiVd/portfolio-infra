# Editing site content

The browser editor changes source files in Git. It never uploads to S3 and has no AWS
credentials. A production change still needs a pull request, passing checks and a human
merge. The existing `apply.yml` then builds Astro and lets Terraform upload `web/dist/`.

## Current Phase 15c boundary

The local editor manages Blog, Homelab, How I work, Home, About and all project records. Project
metadata drives the home list and `/projects`, including order, featured order, status, summary,
stack, images and repository links. The six published case studies also keep their ordinary prose
in the body of their existing project Markdown file. Local editing stays at `/admin/`. The remote
editor and OAuth callback share the separate `cms-auth.aravindakrishnan.cloud` origin, but that
Worker is not live or proven yet. Local mode continues to work without an OAuth app or Worker.

Run local authoring from the repository root:

```bash
cd web
npm ci
npm run dev
```

Open `http://localhost:4321/admin/index.html` in a Chromium-based browser and choose
"Work with Local Repository". When the browser asks, grant access to the repository root,
not `web/` alone, because CMS paths are repository-relative. Sveltia uses the browser's File
System Access API; no proxy, token or extra package is required for this local mode.

Save only on a dedicated content branch. For bodies containing fenced code, Mermaid or
inline HTML, switch the Article/Body field to Markdown source mode before editing. The visual
editor normalizes markup; the source editor preserved those constructs in the Phase 15a
round-trip. Inspect `git diff` after every save. Firefox and Safari do not currently expose
the required directory picker, so use Chromium for local authoring.

## Home, About and Projects

Home and About are singleton JSON files. Edit ordinary page copy and the existing structured
experience, certification, skills and education data there. Keep IDs unchanged. Project filenames
are stable route IDs and cannot be created, deleted or renamed in the editor. Edit their metadata
and, for the six case studies listed below, their source-mode body. An empty image or repository
field means there is no image or repository link. Preserve the
numeric project order and unique featured order values unless the visible list order is changing.

ClearSky, AppStack, CDC, the portfolio, CI/CD for AWS container services and Cloud Detective have
case-study bodies. Their body is deliberately raw HTML inside Markdown, not MDX. Astro's built-in
Markdown renderer cannot pass the current project record into a figure component, and adding MDX
would add an integration and dependency just to resolve image metadata. The build adapter accepts
only the existing section HTML and `data-project-figure` markers, then injects the image path and
alt text from that project's metadata. Do not add `img`, `src` or `alt` to a body. Add a second
figure through **Additional case-study figures**, then refer to it by its next marker number.

Use the Markdown source mode for a case-study body. The visual editor can normalize raw HTML and
break the section structure. Sveltia's source-mode control is required for this field; if the local
bundle does not expose it, edit the Markdown file directly and do not save that body through the
visual editor. Network automation and self-hosted encrypted sync stay bodyless. Do not add prose
to them in the editor. The content test checks both files remain bodyless, and a build never writes
content source files.

## Blog

Choose Blog, then create or edit an entry. Filenames are stable lowercase IDs separated by
dashes. Changing the title must not rename the file. Required fields are title, description,
published date, at least one tag, draft state and article body. New entries default to
`draft: true`.

The build excludes drafts and future-dated posts from routes, the blog index, feed and
sitemap. A draft committed to this public GitHub repository is still public on GitHub.
The draft flag is publication control, not privacy.

## Homelab and How I work

These are singleton Reference pages. The editor can change reviewed public prose and
metadata. Use Markdown source mode for their inline `<figure>` elements. Always inspect the
saved diff and rebuild before committing.

Media upload is intentionally disabled for this phase. Sveltia requires a media path, so it
points to the ignored `web/.cms-unpublished-media/` staging directory rather than
`web/public/`. Do not use the image-upload control; add reviewed public assets in a separate
source change.

Never paste private atlas output, addresses, internal endpoints, account identifiers,
filesystem paths, machine configuration, logs or credentials. The editor does not read the
vault, connect to the homelab or regenerate diagrams. Mermaid sources and downloadable skill
files stay outside CMS control and require normal source review.

## Remote editing prerequisites and blockers

Remote editing uses `https://cms-auth.aravindakrishnan.cloud/`. The Worker serves the pinned CMS
assets and handles its OAuth callback on that same origin. The public site's `/admin/` shell stays
inert on `www`, so ordinary portfolio pages are outside the OAuth trust boundary. The Worker
exchanges a GitHub authorization code because GitHub does not support the required PKCE flow for
this CMS. It forces `public_repo`; GitHub OAuth scopes cannot restrict that grant to only
`portfolio-infra`, so the
token can write other public repositories available to the signed-in account. Sveltia uses
`editorial_workflow`, so Save must create a branch and pull request rather than write to `main`.

This code is not live. A human must complete every item below before trying remote Save:

1. Create a GitHub OAuth app with callback URL `https://cms-auth.aravindakrishnan.cloud/callback`.
2. Protect `main` with required pull requests and the `plan` check. Block force pushes and
   deletion, enforce the rules for administrators, and give the OAuth identity no bypass.
   Editorial workflow is not an authorization boundary by itself.
3. Create the GitHub `cms-auth` environment. Restrict its deployment branch to `main`, require a
   reviewer, and add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `CMS_GITHUB_CLIENT_ID`, and `CMS_GITHUB_CLIENT_SECRET`. Scope the Cloudflare token to this
   account and the minimum Worker/custom-domain permissions. Rotate it after suspected exposure
   and remove it when the Worker is retired.
4. After this workflow file reaches the default branch, approve and manually run the
   `deploy CMS authenticator` workflow. The job also refuses to run unless its ref is `main`.
   GitHub cannot dispatch a workflow that exists only on an unmerged feature branch.
5. Confirm the Worker serves the editor only at `cms-auth.aravindakrishnan.cloud`; its
   `workers.dev` endpoint must be disabled. Confirm `www` still shows the inert local-authoring
   notice at `/admin/index.html`.
6. Sign in and prove that Save creates an editorial branch and pull request. Also attempt a direct
   Git API update to `main` and confirm branch protection rejects it.

Do not put OAuth values in repository files, Terraform, local `.env` files, or Git history. No
remote Save round-trip has been performed for this phase.

## Validate and publish

```
cd web
npm run lint
npm test
npm run build
npm run preview
```

Then commit the source on a feature branch and open a pull request. Saving locally does not
publish. Merging to `main` is the only action that starts the existing production workflow.
There is no manual "upload to S3" step.

## Recovery and removal

Content remains ordinary frontmatter plus Markdown. It can always be edited directly and
built without Sveltia. Revert an unwanted edit through Git.

To retire remote editing, disable the GitHub OAuth app and revoke issued grants first. Then delete
the Worker custom domain, remove the `cms-auth` environment secrets and rotate the Cloudflare
token. Remove the remote `base_url` from the CMS config in the next site change. Removing
`web/public/admin/` and the YAML MIME entry removes the local editor too without changing the
content model or public pages.
