import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  blogId,
  blogSchema,
  pageId,
  pageSchema,
  projectId,
  projectSchema,
  referenceId,
  referenceSchema,
  validateProjectSet,
} from "../src/lib/content-schema.ts";
import { renderCaseStudyBody } from "../src/lib/case-study.ts";

const root = process.cwd();
const blog = join(root, "src/content/blog");
const referenceFile = join(root, "src/content/reference/homelab.md");
const workflowFile = join(root, "src/content/reference/how-i-work.md");
const caseStudyIds = ["clearsky", "appstack", "cdc", "portfolio", "cicd-containers", "cloud-detective"];
const caseStudyFiles = caseStudyIds.map((id) => join(root, "src/content/projects", `${id}.md`));
const dist = join(root, "dist");
const today = new Date().toISOString().slice(0, 10);
const fixtures = ["test-draft.md", "test-future.md", "test-escaped.md", "test-draft-asset.svg"];
const removeFixtures = () => fixtures.forEach((name) => rmSync(join(blog, name), { force: true }));
const build = () => execFileSync(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], { cwd: root, stdio: "pipe" });
const post = (metadata, body = "Test body.") => `---\n${metadata}\n---\n\n${body}\n`;
const outputContains = (value, directory = dist) =>
  readdirSync(directory, { withFileTypes: true }).some((entry) =>
    entry.isDirectory()
      ? outputContains(value, join(directory, entry.name))
      : readFileSync(join(directory, entry.name)).toString().includes(value),
  );

test("reference schema restricts IDs and dates", () => {
  assert.equal(referenceSchema.safeParse({ title: "X", description: "Y", reviewed: "2026-09-09", draft: false }).success, true);
  assert.equal(referenceSchema.safeParse({ title: "X", description: "Y", reviewed: "not-a-date", draft: false }).success, false);
  const yamlDate = referenceSchema.safeParse({ title: "X", description: "Y", reviewed: new Date(Date.UTC(2026, 8, 9)), draft: false });
  assert.equal(yamlDate.success, true);
  assert.equal(yamlDate.data?.reviewed, "2026-09-09");
  assert.equal(referenceId("homelab.md"), "homelab");
  assert.throws(() => referenceId("inventory.md"));
  assert.throws(() => referenceId("nested/homelab.md"));
});

test("page and project schemas restrict singleton IDs and list metadata", () => {
  assert.equal(pageId("home.json"), "home");
  assert.throws(() => pageId("projects.json"));
  assert.equal(pageSchema.safeParse({ id: "home", hero: { role: "Cloud Engineer", introduction: "Copy" }, discover: { blog: { title: "Blog", description: "Copy" }, homelab: { title: "Homelab", description: "Copy" }, workflow: { title: "How", description: "Copy" } }, about: "Copy" }).success, true);
  assert.equal(projectId("clearsky.md"), "clearsky");
  assert.throws(() => projectId("new-project.md"));
  const cmsProject = projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: "", imageAlt: "", repo: "", secondaryRepo: { label: "", url: "" }, order: 1, featuredOrder: null, kicker: "", lede: "" });
  assert.equal(cmsProject.success, true);
  assert.equal(cmsProject.data?.secondaryRepo, undefined);
  assert.deepEqual(cmsProject.data?.additionalFigures, []);
  assert.equal(cmsProject.data?.featuredOrder, undefined);
  assert.equal(cmsProject.data?.kicker, undefined);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "unknown", summary: "Copy", stack: ["Astro"], image: null, imageAlt: "", repo: null, order: 1 }).success, false);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: "/assets/test.png", imageAlt: "", repo: "javascript:alert(1)", order: 1 }).success, false);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: "https://example.com/test.png", imageAlt: "Test", repo: "https://example.com", order: 1 }).success, false);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: null, imageAlt: "", repo: null, additionalFigures: [{ image: "/assets/test.png", imageAlt: "" }], order: 1 }).success, false);
});

test("project set validation protects routes and deterministic ordering", () => {
  const ids = ["clearsky", "appstack", "cdc", "portfolio", "cicd-containers", "cloud-detective", "homelab-sync", "net-automation"];
  const records = ids.map((slug, index) => ({
    name: slug,
    status: "live",
    summary: "Copy",
    stack: ["Astro"],
    image: slug === "cloud-detective" || index > 5 ? null : "/assets/test.png",
    imageAlt: slug === "cloud-detective" || index > 5 ? "" : "Test",
    repo: null,
    order: index + 1,
    featuredOrder: index < 3 ? index + 1 : undefined,
    kicker: index < 6 ? "Kicker" : undefined,
    lede: index < 6 ? "Lede" : undefined,
    slug,
  }));
  assert.equal(validateProjectSet(records).length, 8);
  assert.throws(() => validateProjectSet(records.map((record, index) => ({ ...record, order: index === 7 ? 7 : record.order }))));
  assert.throws(() => validateProjectSet(records.map((record) => ({ ...record, featuredOrder: undefined }))));
  assert.throws(() => validateProjectSet(records.map((record) => record.slug === "clearsky" ? { ...record, kicker: undefined } : record)));
  assert.throws(() => validateProjectSet(records.slice(1)));
});

test("blog schema rejects malformed dates and IDs", () => {
  assert.equal(blogSchema.safeParse({ title: "Invalid", description: "Invalid date", published: "2026-99-99", tags: ["test"], draft: false }).success, false);
  const cmsDate = blogSchema.safeParse({ title: "CMS", description: "Cleared optional date", published: "2026-09-10", updated: "", tags: ["test"], draft: true });
  assert.equal(cmsDate.success, true);
  assert.equal(cmsDate.data?.updated, undefined);
  const yamlPublished = blogSchema.safeParse({ title: "CMS", description: "Unquoted editor date", published: new Date(Date.UTC(2026, 8, 10)), tags: ["test"], draft: true });
  assert.equal(yamlPublished.success, true);
  assert.equal(yamlPublished.data?.published, "2026-09-10");
  assert.equal(blogId("stable-post.md"), "stable-post");
  assert.throws(() => blogId("Unsafe ID!.md"));
  assert.throws(() => blogId("nested/stable-post.md"));
});

test("draft references have no route or discovery links", () => {
  const originals = [referenceFile, workflowFile].map((file) => readFileSync(file, "utf8"));
  try {
    [referenceFile, workflowFile].forEach((file) => writeFileSync(file, readFileSync(file, "utf8").replace("draft: false", "draft: true")));
    build();
    for (const id of ["homelab", "how-i-work"]) {
      assert.equal(existsSync(join(dist, `${id}.html`)), false);
      for (const file of ["index.html", "sitemap.xml"]) {
        assert.equal(readFileSync(join(dist, file), "utf8").includes(id), false);
      }
    }
  } finally {
    [referenceFile, workflowFile].forEach((file, index) => writeFileSync(file, originals[index]));
    build();
  }
});

test("public review skill has source, license and source-edit safeguards", () => {
  const skill = readFileSync(join(root, "public/skills/static-site-review/SKILL.md"), "utf8");
  const readme = readFileSync(join(root, "public/skills/static-site-review/README.md"), "utf8");
  assert.match(skill, /Trigger/);
  assert.match(skill, /does not edit source files/i);
  assert.match(skill, /builds may write generated artifacts/i);
  assert.match(skill, /Do not edit source, merge, deploy/i);
  assert.match(skill, /verify identity and account/i);
  assert.match(readme, /github\.com\/arkhiVd\/portfolio-infra/);
  assert.match(readFileSync(join(root, "public/skills/static-site-review/LICENSE.txt"), "utf8"), /MIT License/);
});

test("CMS remote shell, worker provenance, policy isolation and deploy workflow stay narrow", () => {
  const admin = join(root, "public/admin");
  const config = readFileSync(join(admin, "config.yml"), "utf8");
  const shell = readFileSync(join(admin, "index.html"), "utf8");
  const bootstrap = readFileSync(join(admin, "bootstrap.js"), "utf8");
  const headers = readFileSync(join(root, "../cms-auth/assets/_headers"), "utf8");
  const bundle = readFileSync(join(admin, "sveltia-cms-0.209.0.js"));
  const terraform = readFileSync(join(root, "../frontend.tf"), "utf8");
  const worker = readFileSync(join(root, "../cms-auth/src/index.js"));
  const upstreamWorker = readFileSync(join(root, "../cms-auth/vendor/index.js"));
  const workerSource = readFileSync(join(root, "../cms-auth/SOURCE.md"), "utf8");
  const workerLicense = readFileSync(join(root, "../cms-auth/LICENSE.txt"), "utf8");
  const wrangler = readFileSync(join(root, "../cms-auth/wrangler.toml"), "utf8");
  const workflow = readFileSync(join(root, "../.github/workflows/deploy-cms-auth.yml"), "utf8");

  assert.match(config, /publish_mode: editorial_workflow/);
  assert.match(config, /base_url: https:\/\/cms-auth\.aravindakrishnan\.cloud/);
  assert.match(config, /auth_scope: public_repo/);
  assert.match(config, /local_backend: true/);
  assert.match(config, /folder: web\/src\/content\/blog/);
  assert.match(config, /file: web\/src\/content\/pages\/home\.json/);
  assert.match(config, /file: web\/src\/content\/pages\/about\.json/);
  assert.match(config, /folder: web\/src\/content\/projects/);
  assert.match(config, /media_folder: web\/\.cms-unpublished-media/);
  assert.doesNotMatch(config, /media_folder: web\/public/);
  for (const field of ["title", "description", "published", "updated", "tags", "draft", "body"]) {
    assert.match(config, new RegExp(`name: ${field}(?:,|\\n)`));
  }
  for (const file of ["homelab.md", "how-i-work.md"]) assert.match(config, new RegExp(file.replace(".", "\\.")));
  for (const field of ["order", "featuredOrder", "secondaryRepo", "additionalFigures", "kicker", "lede", "body"]) {
    assert.match(config, new RegExp(`name: ${field}(?:,|\\n)`));
  }
  assert.match(config, /label: Case-study body, name: body, widget: markdown, required: false/);
  assert.doesNotMatch(shell, /src=["']https?:/);
  assert.match(shell, /noindex,nofollow,noarchive/);
  assert.match(shell, /\.\/bootstrap\.js/);
  assert.doesNotMatch(shell, /onload=|<script>[^<]/);
  assert.match(bootstrap, /cms-auth\.aravindakrishnan\.cloud/);
  assert.match(bootstrap, /sveltia-cms-0\.209\.0\.js/);
  assert.match(bootstrap, /CMS\.init\(\)/);
  assert.match(shell, /Remote editing runs at/);
  assert.match(terraform, /"yml"\s+= "application\/yaml"/);
  assert.match(terraform, /"yaml"\s+= "application\/yaml"/);
  assert.match(terraform, /resource "aws_cloudfront_response_headers_policy" "security"[\s\S]*?connect-src 'self' \$\{trimsuffix/);
  assert.doesNotMatch(terraform, /admin_security|path_pattern\s+= "admin\/\*"/);
  assert.match(headers, /connect-src 'self' https:\/\/api\.github\.com/);
  assert.match(headers, /script-src 'self';/);
  assert.doesNotMatch(headers, /script-src 'self' 'unsafe-inline'/);
  assert.match(headers, /img-src 'self' data: blob: https:\/\/avatars\.githubusercontent\.com/);
  assert.equal(createHash("sha256").update(bundle).digest("hex"), "a2bc0e080e0eb1599ae0ae82026619e64442c363ee36882e965892c1acc61d85");
  assert.equal(createHash("sha256").update(upstreamWorker).digest("hex"), "a2858897152ffda6652e060f12f4976183879ae8baec6d00e60957f2ea802985");
  assert.equal(createHash("sha256").update(worker).digest("hex"), "b553bc400385ff63eada7750d4215d1e00b06dba7de2eabed1ec7f3f7072623e");
  assert.match(workerSource, /449b1d357e0173491d453749ed2e4507fef6399a/);
  assert.match(workerLicense, /MIT License/);
  assert.match(wrangler, /pattern = "cms-auth\.aravindakrishnan\.cloud", custom_domain = true/);
  assert.match(wrangler, /ALLOWED_DOMAINS = "cms-auth\.aravindakrishnan\.cloud"/);
  assert.match(wrangler, /directory = "\.worker-assets"/);
  assert.match(wrangler, /run_worker_first = \["\/auth", "\/callback", "\/oauth\/\*"\]/);
  assert.match(wrangler, /workers_dev = false/);
  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /\n  push:|\n  pull_request:/);
  assert.match(workflow, /cloudflare\/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0/);
  assert.match(workflow, /wranglerVersion: 4\.131\.1/);
  for (const secret of ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CMS_GITHUB_CLIENT_ID", "CMS_GITHUB_CLIENT_SECRET"]) {
    assert.match(workflow, new RegExp(`secrets\\.${secret}`));
  }
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
  assert.doesNotMatch(workflow, /AWS_|terraform|apply\.yml|test-client|test-client-secret/);
  assert.doesNotMatch(config, /aws|s3|cloudfront/i);
});

test("case-study bodies are source-owned, route-stable and safe to render", () => {
  const sourceHashes = new Map(caseStudyFiles.map((file) => [file, createHash("sha256").update(readFileSync(file)).digest("hex")]));
  for (const id of caseStudyIds) {
    const source = readFileSync(join(root, "src/content/projects", `${id}.md`), "utf8");
    const body = source.split(/^---\s*$/m).slice(2).join("---").trim();
    const route = readFileSync(join(root, "src/pages/projects", `${id}.astro`), "utf8");
    assert.ok(body.length > 0, `${id} has a CMS-editable body`);
    assert.doesNotMatch(body, /<(?:img)\b|\s(?:src|alt)=/i, `${id} does not duplicate figure metadata`);
    assert.match(body, /<p class="label">problem<\/p>[\s\S]*?<p class="label">architecture<\/p>[\s\S]*?<p class="label">decisions and tradeoffs<\/p>[\s\S]*?<p class="label">what broke<\/p>/);
    assert.match(route, new RegExp(`getProject\\("${id}"\\)`));
    assert.match(route, new RegExp(`getEntry\\("project", "${id}"\\)`));
    assert.match(route, /renderCaseStudyBody\(entry!\.body, project\)/);
    assert.doesNotMatch(route, /<Block\b|<p\b|<figure\b|<dl\b|<ul\b/);
  }
  for (const id of ["homelab-sync", "net-automation"]) {
    const source = readFileSync(join(root, "src/content/projects", `${id}.md`), "utf8");
    assert.equal(source.split(/^---\s*$/m).slice(2).join("---").trim(), "", `${id} remains bodyless`);
  }
  const rendered = renderCaseStudyBody('<section class="block wrap"><p class="label">problem</p><h2>Problem</h2></section><section class="block wrap"><p class="label">architecture</p><h2>Architecture</h2><figure class="arch" data-project-figure="0"><figcaption>Caption</figcaption></figure></section><section class="block wrap"><p class="label">decisions and tradeoffs</p><h2>Decisions</h2></section><section class="block wrap"><p class="label">what broke</p><h2>Failure</h2></section>', { slug: "test", image: "/assets/img/test.png", imageAlt: "Test figure", additionalFigures: [] });
  assert.match(rendered, /<img src="\/assets\/img\/test\.png" alt="Test figure" loading="lazy" decoding="async">/);
  assert.throws(() => renderCaseStudyBody('<script>alert(1)<\/script>', { slug: "test", image: null, imageAlt: "", additionalFigures: [] }));
  assert.throws(() => renderCaseStudyBody('<section class="block wrap"><p class="label">problem<\/section><\/p>', { slug: "test", image: null, imageAlt: "", additionalFigures: [] }));
  assert.throws(() => renderCaseStudyBody('<section class="block wrap"><p class="label">problem<\/p><h2>Heading<section class="block wrap"><\/section><\/h2><\/section>', { slug: "test", image: null, imageAlt: "", additionalFigures: [] }));
  assert.throws(() => renderCaseStudyBody('<section class="block wrap"><p class="label">problem<\/p><h2>Problem<\/h2><\/section><section class="block wrap"><p class="label">architecture<\/p><h2>Architecture<\/h2><\/section><section class="block wrap"><p class="label">decisions and tradeoffs<\/p><h2>Decisions<\/h2><\/section><section class="block wrap"><p class="label">what broke<\/p><h2>Failure<\/h2><\/section>', { slug: "test", image: "/assets/img/test.png", imageAlt: "Test", additionalFigures: [] }));
  build();
  for (const [file, hash] of sourceHashes) {
    assert.equal(createHash("sha256").update(readFileSync(file)).digest("hex"), hash, `${file} is unchanged by the build`);
  }
});

test("published output excludes drafts, future posts and their assets", (t) => {
  t.after(() => {
    removeFixtures();
    build();
  });
  writeFileSync(join(blog, "test-draft-asset.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1\" height=\"1\"><text>DRAFT_ONLY_ASSET_MARKER</text></svg>");
  writeFileSync(join(blog, "test-draft.md"), post(`title: Draft\ndescription: Draft fixture\npublished: "${today}"\ntags: [test]\ndraft: true`));
  writeFileSync(join(blog, "test-future.md"), post('title: Future\ndescription: Future fixture\npublished: "2999-01-01"\ntags: [test]\ndraft: false'));
  writeFileSync(join(blog, "test-escaped.md"), post(`title: "Cache & XML"\ndescription: "Escapes & checks links"\npublished: "${today}"\ntags: [test]\ndraft: false`));
  build();

  const index = readFileSync(join(dist, "blog.html"), "utf8");
  const feed = readFileSync(join(dist, "feed.xml"), "utf8");
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  assert.ok(existsSync(join(dist, "blog/test-escaped.html")));
  for (const id of ["test-draft", "test-future"]) {
    assert.equal(existsSync(join(dist, `blog/${id}.html`)), false);
    assert.equal(index.includes(id), false);
    assert.equal(feed.includes(id), false);
    assert.equal(sitemap.includes(id), false);
  }
  assert.equal(outputContains("DRAFT_ONLY_ASSET_MARKER"), false);
  assert.match(feed, /https:\/\/www\.aravindakrishnan\.cloud\/blog\/two-cdn-cache-trap\.html/);
  assert.match(index, /rel="alternate"[^>]+type="application\/rss\+xml"[^>]+href="\/feed\.xml"/);
  assert.match(index, /<a class="label" href="\/feed\.xml">RSS feed<\/a>/);
  assert.match(sitemap, /https:\/\/www\.aravindakrishnan\.cloud\/blog\/two-cdn-cache-trap\.html/);
  assert.ok(feed.includes("Cache &amp; XML"));
});
