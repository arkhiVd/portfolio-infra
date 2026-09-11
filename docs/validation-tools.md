# Optional local browser gate

`tools/validate-browser.cjs` checks built HTML without adding browser tooling to the site.
Production and CI do not depend on these packages. Use a disposable tool directory and the
versions recorded in `TASKS.md`:

```bash
export BROWSER_TOOLS="$(mktemp -d)"
npm install --prefix "$BROWSER_TOOLS" --ignore-scripts --no-audit --no-fund \
  --save-exact playwright@1.63.0 axe-core@4.13.0
BROWSER_TOOLS="$BROWSER_TOOLS" CHROME_PATH=/usr/bin/chromium \
  node tools/validate-browser.cjs
```

The test starts a loopback-only static server, injects a local visitor API stub and never
calls production. It checks all non-redirect pages for local links, same-page anchors,
broken images, third-party requests, JavaScript errors, no-JS content, keyboard focus,
axe violations and horizontal overflow. It writes screenshots and a JSON summary under
`docs/evidence/`.

Use an installed Chromium-compatible executable for `CHROME_PATH`. Review package source
and versions before installing them. Remove the temporary directory when finished.
Lighthouse is a separate manual gate; its output can be large and is not committed.
