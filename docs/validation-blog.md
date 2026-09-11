# Blog validation

Phase 11, 2026-09-09. Depends on the layout and planning PRs. No deployment performed.

```text
Node 24.18.1 archive SHA-256: OK
astro check: 27 files, 0 errors, 0 warnings, 0 hints
npm test: 2 passed, 0 failed
production build after test fixture cleanup: 16 HTML pages
browser matrix: 11 non-redirect pages
axe-core 4.13.0: 0 WCAG 2 A/AA and 2.1 A/AA violations per checked page
horizontal overflow: none at 320, 375, 768, 1280, 2560 px
no-JS main/heading and keyboard skip link: PASS
local links: PASS
third-party requests: 0
JavaScript errors: 0
visitor-counter stub success/failure: PASS, not a live API test
actionlint 1.7.12: exit 0
terraform fmt/validate: PASS
terraform plan: 4 add, 10 change, 1 destroy, 0 replace
checkov: 116 passed, 30 failed, 0 skipped
```

The plan was read in full. All actions affect static S3 objects. The one expected destroy
removes the previous hashed CSS file; its replacement has a new object key. No bucket,
CloudFront distribution, Lambda, table or IAM role is changed or destroyed.

The test command rebuilds production output after removing fixtures. Tests cover metadata
and filename rejection, published-only routes/feed/sitemap, XML escaping and exclusion of
a source-only draft asset. Browser checks used a local counter stub to avoid incrementing
production counts. Existing Checkov findings are not waived.

Screenshots: `docs/evidence/index-{1280,375}.png`, `blog-{1280,375}.png` and
`blog-two-cdn-cache-trap-{1280,375}.png`. Layout captures were refreshed with an explicit
root background so full-page screenshots retain the approved dark background.

Fresh independent review and Lighthouse results will be recorded before final merge
approval. No new page has a production URL until the human merges and CI deploys it.
