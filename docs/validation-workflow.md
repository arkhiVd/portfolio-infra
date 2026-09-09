# How I work validation

Phase 13, 2026-09-09. One Markdown reference contains overview, AI workflow, setup/tools
and reusable skills. No separate Uses or Skills page. Includes a process diagram and
one new public static-site-review skill with its own MIT license and install example.

```text
Pinned Node 24.18.1: lint passed; 5 content/skill tests passed
Build: 18 HTML pages
Browser matrix: 13 non-redirect pages
axe-core 4.13.0: 0 WCAG 2 A/AA and 2.1 A/AA violations per page
Overflow: none at 320, 375, 768, 1280, 2560 px
No-JS content, local links and keyboard skip link: PASS
Third-party requests: 0; JavaScript errors: 0
Skill copy into a disposable target: skill-copy-ok
Terraform fmt/validate: PASS
Read-only plan: 13 add, 10 change, 1 destroy, 0 replace
```

The plan is cumulative against deployed main, not an incremental count to add to the
parent PR's plan. Only static S3 objects change; the destroy retires the old hashed CSS.
Markdown downloads now have `text/markdown; charset=utf-8` via `frontend.tf`.

Coordinator checks caught a stale skill-wording assertion, six-link navigation overflow
at 320 px, and How I work anchor links appearing on Homelab. All were corrected and the
browser matrix rerun. Screenshots are `docs/evidence/how-i-work-{1280,375}.png` and the
updated homepage captures. Final performance validation and fresh review remain pending.

Public prose omits private configs, paths, account identifiers and session records. The
page describes observed tool roles and review boundaries without claiming measured
subscription savings. Builds are explicitly allowed to write generated artifacts; the
skill prohibits source edits and deployment during review.
