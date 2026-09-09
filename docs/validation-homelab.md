# Homelab validation

Phase 12, 2026-09-09. Adds a curated Markdown reference and two source-controlled
Mermaid diagrams with committed SVG exports. Depends on the blog foundation.

```text
Pinned Node 24.18.1: lint passed, 4 tests passed
Build: 17 HTML pages
Browser checks: 12 non-redirect pages
axe-core 4.13.0: 0 WCAG 2 A/AA and 2.1 A/AA violations per page
Overflow: none at 320, 375, 768, 1280, 2560 px
Local links, no-JS content and keyboard skip link: PASS
External requests: 0; console errors: 0
Mermaid CLI 11.17.0 repeated SVG renders: byte-identical
SVG backgrounds: rgb(15, 18, 24)
SVG viewBox widths: access 248.83, sync 291.63
Label size: 16 px at intrinsic size; full-size links included
Terraform plan: 7 add, 10 change, 1 destroy, 0 replace
```

Plan reviewed against the already-read blog plan. Only static S3 objects change.
The expected destroy removes the old hashed CSS object, not a service or data store.
The two new diagram objects have `image/svg+xml` content type.

The public overview records only independently checked hardware, OS and selected Docker,
Tailscale and Syncthing roles. It does not certify a complete live inventory. Public source
and SVGs omit private identifiers, addresses, endpoints, operational logs and service counts.
No private files, SSH access or renderer installation is needed to build the site.

Screenshots: `docs/evidence/homelab-1280.png` and `homelab-375.png`. Initial screenshot
review caught white SVG backgrounds and small sync labels; both were corrected and
recaptured. No production apply performed. Fresh review and the final performance gate
remain pending. Existing Checkov findings are unchanged, not waived.
