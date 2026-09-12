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

const root = process.cwd();
const blog = join(root, "src/content/blog");
const referenceFile = join(root, "src/content/reference/homelab.md");
const workflowFile = join(root, "src/content/reference/how-i-work.md");
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
  assert.equal(cmsProject.data?.featuredOrder, undefined);
  assert.equal(cmsProject.data?.kicker, undefined);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "unknown", summary: "Copy", stack: ["Astro"], image: null, imageAlt: "", repo: null, order: 1 }).success, false);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: "/assets/test.png", imageAlt: "", repo: "javascript:alert(1)", order: 1 }).success, false);
  assert.equal(projectSchema.safeParse({ name: "Project", status: "live", summary: "Copy", stack: ["Astro"], image: "https://example.com/test.png", imageAlt: "Test", repo: "https://example.com", order: 1 }).success, false);
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

test("CMS config matches content schemas and uses a pinned same-origin bundle", () => {
  const admin = join(root, "public/admin");
  const config = readFileSync(join(admin, "config.yml"), "utf8");
  const shell = readFileSync(join(admin, "index.html"), "utf8");
  const bundle = readFileSync(join(admin, "sveltia-cms-0.209.0.js"));
  const terraform = readFileSync(join(root, "../frontend.tf"), "utf8");

  assert.match(config, /publish_mode: editorial_workflow/);
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
  for (const field of ["order", "featuredOrder", "secondaryRepo", "kicker", "lede"]) {
    assert.match(config, new RegExp(`name: ${field}(?:,|\\n)`));
  }
  assert.doesNotMatch(shell, /src=["']https?:/);
  assert.match(shell, /noindex,nofollow,noarchive/);
  assert.match(shell, /localHosts\.has/);
  assert.match(terraform, /"yml"\s+= "application\/yaml"/);
  assert.match(terraform, /"yaml"\s+= "application\/yaml"/);
  assert.equal(createHash("sha256").update(bundle).digest("hex"), "a2bc0e080e0eb1599ae0ae82026619e64442c363ee36882e965892c1acc61d85");
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
