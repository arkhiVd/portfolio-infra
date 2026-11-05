import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Load the CloudFront Function source as CloudFront does: a script with a global handler.
const source = readFileSync(new URL("../../edge/clean-urls.js", import.meta.url), "utf8");
const handler = new Function(`${source}\nreturn handler;`)();
const rewrite = (uri) => handler({ request: { uri, querystring: {} } }).uri;

test("extensionless paths map to their .html object", () => {
  assert.equal(rewrite("/about"), "/about.html");
  assert.equal(rewrite("/projects"), "/projects.html");
  assert.equal(rewrite("/projects/clearsky"), "/projects/clearsky.html");
  assert.equal(rewrite("/blog/two-cdns"), "/blog/two-cdns.html");
});

test("one trailing slash is dropped before mapping", () => {
  assert.equal(rewrite("/blog/"), "/blog.html");
  assert.equal(rewrite("/homelab/"), "/homelab.html");
  assert.equal(rewrite("/about.html/"), "/about.html");
});

test("root and file paths pass through unchanged", () => {
  assert.equal(rewrite("/"), "/");
  assert.equal(rewrite("//"), "/");
  assert.equal(rewrite("/about.html"), "/about.html");
  assert.equal(rewrite("/resume.pdf"), "/resume.pdf");
  assert.equal(rewrite("/assets/js/visitorscript.js"), "/assets/js/visitorscript.js");
  assert.equal(rewrite("/feed.xml"), "/feed.xml");
});

test("the query string is left alone", () => {
  const request = handler({ request: { uri: "/about", querystring: { z: { value: "1" } } } });
  assert.deepEqual(request.querystring, { z: { value: "1" } });
});
