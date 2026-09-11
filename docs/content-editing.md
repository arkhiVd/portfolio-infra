# Editing site content

The browser editor changes source files in Git. It never uploads to S3 and has no AWS
credentials. A production change still needs a pull request, passing checks and a human
merge. The existing `apply.yml` then builds Astro and lets Terraform upload `web/dist/`.

## Current Phase 15b boundary

The local editor manages Blog, Homelab, How I work, Home, About and the metadata for all eight
projects. Project metadata drives the home list and `/projects`, including order, featured order,
status, summary, stack, images and repository links. The six existing case-study bodies remain in
Astro for Phase 15b2. Do not use the optional kicker or lede fields to imply that the body moved.
The deployed `/admin/` route is intentionally inert until the remote GitHub authentication design
passes its own security review.

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
only. An empty image or repository field means there is no image or repository link. Preserve the
numeric project order and unique featured order values unless the visible list order is changing.

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

## Validate and publish

```bash
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
built without Sveltia. Revert an unwanted edit through Git. Removing `web/public/admin/`
and the YAML MIME entry removes the editor without changing the content model or public
pages.
