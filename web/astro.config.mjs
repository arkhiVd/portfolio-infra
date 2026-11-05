// @ts-check
import { defineConfig } from "astro/config";

// Production emits file-style routes (about.html). Pages link to clean paths (/about), and the
// viewer-request CloudFront Function in edge/clean-urls.js maps them to these objects.
// Shared templates use BASE_URL through src/lib/site.ts.
export default defineConfig({
  site: "https://www.aravindakrishnan.cloud",
  base: "/",
  trailingSlash: "ignore",
  build: {
    // Emit page.html instead of page/index.html. edge/clean-urls.js maps /page and /page/
    // to page.html, so changing this format means changing that function too.
    format: "file",
    inlineStylesheets: "never",
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
