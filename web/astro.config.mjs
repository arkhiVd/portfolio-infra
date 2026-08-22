// @ts-check
import { defineConfig } from "astro/config";

// Production emits file-style routes because CloudFront's private S3 origin has no
// extensionless-path rewrite. Shared templates use BASE_URL through src/lib/site.ts.
export default defineConfig({
  site: "https://www.aravindakrishnan.cloud",
  base: "/",
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
