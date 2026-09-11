---
name: static-site-review
description: Checklist for reviewing a static site without source edits before human approval.
license: MIT
---

# Static site review

## Trigger

Use this when a static site change needs a bounded, independent review before a person approves it. The review does not edit source files; builds may write generated artifacts. Confirm the repository and requested scope first. Do not inspect unrelated private material.

## Review

1. Read the repository's local instructions and the change diff. List the files in scope.
2. Read the design contract, routes, content schema, layout, navigation, and relevant tests. Check that new claims have a source.
3. Inspect changed content for secrets, private paths, internal addresses, account identifiers, invented metrics, and unclear ownership.
4. Check keyboard focus, heading order, link names, image alternatives, reduced motion, contrast, and 320–375px layout behavior.
5. Run the repository's documented lint, test, and build commands with the pinned toolchain. Do not install dependencies as part of review unless the operator explicitly asks.
6. Review the generated output for routes, drafts, sitemap links, MIME-sensitive assets, and accidental external requests.
7. Record failures with file and line references. Do not edit source, merge, deploy, or claim a check you did not run.
8. If an operator separately authorizes an infrastructure plan, verify identity and account before running it. Never use a default account profile.

## Report

State the commands run, their real results, open risks, and whether human approval is still needed. A review is evidence, not permission to deploy.
