import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { blogId, blogSchema } from "../src/lib/content-schema.ts";

const root = process.cwd();
const blog = join(root, "src/content/blog");
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

test("blog schema rejects malformed dates and IDs", () => {
  assert.equal(blogSchema.safeParse({ title: "Invalid", description: "Invalid date", published: "2026-99-99", tags: ["test"], draft: false }).success, false);
  assert.equal(blogId("stable-post.md"), "stable-post");
  assert.throws(() => blogId("Unsafe ID!.md"));
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
  assert.match(sitemap, /https:\/\/www\.aravindakrishnan\.cloud\/blog\/two-cdn-cache-trap\.html/);
  assert.ok(feed.includes("Cache &amp; XML"));
});
