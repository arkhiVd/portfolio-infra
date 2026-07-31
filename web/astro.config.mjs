// @ts-check
import { defineConfig } from "astro/config";

// The rebuild is served under the preview/ key prefix until the Phase 8 cutover, so `base`
// is /preview here and becomes / at cutover. Nothing may hardcode a leading-slash URL —
// use BASE_URL (see src/lib/url.ts) or the link will 404 under the prefix.
export default defineConfig({
  site: "https://www.aravindakrishnan.cloud",
  base: "/preview",
  trailingSlash: "ignore",
  build: {
    // Emit page.html instead of page/index.html: CloudFront has no index-document rewrite
    // for sub-paths, only for the root, so directory-style URLs would 403.
    format: "file",
    inlineStylesheets: "never",
  },
  compressHTML: true,
  devToolbar: { enabled: false },
});
