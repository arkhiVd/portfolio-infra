# Sveltia CMS bundle

`./sveltia-cms-0.209.0.js` is the unmodified browser bundle from
`@sveltia/cms` 0.209.0.

- Upstream release: https://github.com/sveltia/sveltia-cms/releases/tag/v0.209.0
- Bundle source: https://unpkg.com/@sveltia/cms@0.209.0/dist/sveltia-cms.js
- SHA-256: `a2bc0e080e0eb1599ae0ae82026619e64442c363ee36882e965892c1acc61d85`
- Reviewed: 2026-09-10
- License: MIT, copied in `LICENSE.txt`

To update it, choose an upstream release, review its release notes and license, download the
exact version to a temporary file, verify its digest, and replace the versioned filename.
Update the script import in `index.html`, this record, and the build tests in the same PR.
Never replace this with a runtime CDN import. Normal portfolio pages must not contact a CMS
or third-party script origin.

Gitleaks' generic-key rule flags one minified upstream string at line 2026. `.gitleaksignore`
excludes that exact file/rule/line fingerprint. The SHA-256 assertion prevents an altered
bundle from passing as this reviewed file; all first-party files remain fully scanned.
