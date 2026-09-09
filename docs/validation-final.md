# Final validation

Phase 14, 2026-09-09. No deployment performed.

## Local gate

```text
Node 24.18.1 upstream SHA-256: OK
clean npm ci: found 0 vulnerabilities
astro check: 29 files, 0 errors, 0 warnings, 0 hints
node:test: 5 passed, 0 failed
built output: 18 HTML pages after fixture cleanup
npm audit: 0 vulnerabilities
actionlint 1.7.12: exit 0
git diff --check: exit 0
gitleaks origin/main..HEAD: 5 commits, no leaks found
terraform fmt/validate: PASS
terraform plan: 13 add, 10 change, 1 destroy, 0 replace
checkov: 116 passed, 30 failed, 0 skipped
```

The cumulative plan changes only S3 objects. The one destroy removes the old hashed CSS
object and has a new hashed replacement. No bucket, CloudFront, Lambda, DynamoDB, IAM or
state resource changes. Checkov disposition is in `docs/checkov-triage.md`; unresolved
hardening items require a separate Risky phase.

## Rendered checks

All 13 non-redirect pages passed local links, same-page anchors, images, no-JS content,
visible keyboard focus, zero axe WCAG 2/2.1 A/AA violations, zero third-party requests,
zero JavaScript errors, and no horizontal overflow at 320, 375, 768, 1280 or 2560 px.
RSS and sitemap parse as XML. Counter success/failure used a local stub, not production.

Lighthouse 13.4.1 mobile scored 100 in Performance, Accessibility, Best Practices and SEO
on every non-redirect page. Per-route category scores, mobile settings, timestamps and
metrics are committed in `docs/evidence/lighthouse-results.json`. Full reports remain local.

The first article run exposed 2,950 ms total blocking time and Performance 71. The ocean
shader now uses a smaller drawing buffer, caps ambient updates at 12 frames per second and
pauses while hidden. The follow-up article run had 0 ms blocking time and Performance 100;
the complete page run then met the same threshold.

## Review and remaining gates

A fresh Sol-medium review identified missing RSS discovery, missing committed Lighthouse
evidence and stale acceptance-status wording. RSS autodiscovery and a visible feed link,
content tests, Lighthouse evidence and SPEC status were added. The reviewer confirmed all
three findings resolved with no new actionable blocker. GitHub Actions plan passed on
PRs #27 and #29–#32; docs-only PR #28 reports no check. Human approval remains required.

Live URLs, headers, MIME behavior, visitor API behavior, CDN Lighthouse and empty
post-deploy plan cannot be checked until the human approves merge and CI deploys. Monthly
cost needs one full month. Agents do not merge or apply.
