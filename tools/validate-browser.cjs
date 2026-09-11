// Optional local gate. Pinned tool setup is documented in docs/validation-tools.md.
const { createRequire } = require('node:module');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const tools = createRequire(path.resolve(process.env.BROWSER_TOOLS || '.', 'package.json'));
const { chromium } = tools('playwright');
const root = path.resolve('web/dist');
const evidence = path.resolve('docs/evidence');
const origin = 'http://127.0.0.1:8766';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain', '.md': 'text/markdown',
  '.yml': 'application/yaml', '.yaml': 'application/yaml' };
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, origin).pathname); }
  catch { res.writeHead(400).end(); return; }
  // Local stub only: never call the production counter from this test.
  if (pathname === '/assets/js/visitorscript.js') {
    res.setHeader('Content-Type', types['.js']); res.end('window.VISITOR_API="/__visitor";'); return;
  }
  if (pathname === '/__visitor') {
    res.setHeader('Content-Type', 'application/json'); res.end('{"count":1234}'); return;
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + '/') || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
const files = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const captures = new Set(['/index.html', '/blog.html', '/blog/two-cdn-cache-trap.html', '/homelab.html', '/how-i-work.html']);

(async () => {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(8766, '127.0.0.1', resolve); });
  if (process.argv.includes('--serve')) { console.log(`Local built-site preview: ${origin}`); return; }
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true,
    args: ['--enable-unsafe-swiftshader', '--host-resolver-rules=MAP portfolio.test 127.0.0.1'] });
  const results = [];
  try {
    for (const file of files(root).filter(file => file.endsWith('.html') && !/-detail\.html$/.test(file) && !file.includes('/admin/'))) {
      const route = '/' + path.relative(root, file);
      const external = [], errors = [];
      const page = await browser.newPage({ viewport: { width: 375, height: 900 }, reducedMotion: 'reduce' });
      page.on('request', request => {
        if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) external.push(request.url());
      });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector('html.is-ready');
      assert.equal(await page.locator('h1').count(), 1, route + ': heading');
      assert.equal(await page.locator('#visitor-count').innerText(), '1,234');
      for (const width of [320, 375, 768, 1280, 2560]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route + ': overflow ' + width);
        if (captures.has(route) && [375, 1280].includes(width)) {
          await page.screenshot({ path: path.join(evidence, route.slice(1, -5).replaceAll('/', '-') + '-' + width + '.png'), fullPage: true });
        }
      }
      await page.setViewportSize({ width: 375, height: 900 });
      await page.addScriptTag({ path: tools.resolve('axe-core/axe.min.js') });
      const axe = await page.evaluate(() => window.axe.run(document,
        { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
      assert.deepEqual(axe.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), [], route + ': axe');
      assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(i => !i.complete || !i.naturalWidth).map(i => i.src)), [], route + ': images');
      assert.deepEqual(external, [], route + ': third-party requests');
      assert.deepEqual(errors, [], route + ': console errors');
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))) {
        if (!href || /^(https?:|mailto:|tel:)/.test(href)) continue;
        const target = new URL(href, origin + route);
        assert.ok(fs.existsSync(path.join(root, target.pathname === '/' ? 'index.html' : target.pathname)), route + ': link ' + href);
        if (target.hash && target.pathname === route) {
          assert.ok(await page.locator('[id="' + decodeURIComponent(target.hash.slice(1)) + '"]').count(), route + ': anchor ' + href);
        }
      }
      await page.close();
      const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
      await nojs.goto(origin + route);
      assert.ok(await nojs.locator('main').isVisible());
      assert.ok(await nojs.locator('h1').isVisible());
      await nojs.keyboard.press('Tab');
      assert.equal(await nojs.evaluate(() => document.activeElement.textContent), 'Skip to content');
      const tabStops = await nojs.locator('a[href]').count();
      for (let i = 0; i < tabStops; i++) {
        const focus = await nojs.evaluate(() => {
          const el = document.activeElement, style = getComputedStyle(el);
          return el.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        });
        assert.ok(focus, route + ': visible keyboard focus at stop ' + i);
        await nojs.keyboard.press('Tab');
      }
      await nojs.close();
      const result = { route, axeViolations: 0, overflow: 'none at 320/375/768/1280/2560',
        noJS: 'PASS', keyboardFocus: 'PASS', links: 'PASS', externalRequests: 0, consoleErrors: 0 };
      results.push(result); console.log(JSON.stringify(result));
    }
    const localAdmin = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await localAdmin.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await localAdmin.goto(origin + '/admin/index.html');
    await localAdmin.getByText('Work with Local Repository').waitFor();
    assert.equal(await localAdmin.getByText('There is an error in the CMS configuration.').count(), 0);
    await localAdmin.close();

    const publicAdmin = await browser.newPage();
    const publicRequests = [];
    publicAdmin.on('request', request => publicRequests.push(request.url()));
    await publicAdmin.route('https://www.aravindakrishnan.cloud/**', route => {
      const url = new URL(route.request().url());
      const file = path.resolve(root, '.' + url.pathname);
      if (file.startsWith(root + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) {
        route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
      } else route.fulfill({ status: 404, body: '' });
    });
    await publicAdmin.goto('https://www.aravindakrishnan.cloud/admin/index.html');
    await publicAdmin.getByText(/Remote editing runs at/).waitFor();
    assert.equal(publicRequests.some(url => /sveltia-cms-0\.209\.0\.js|config\.yml/.test(url)), false);
    await publicAdmin.close();

    const remoteAdmin = await browser.newPage();
    const remoteRequests = [];
    remoteAdmin.on('request', request => remoteRequests.push(request.url()));
    await remoteAdmin.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === 'https://cms-auth.aravindakrishnan.cloud') {
        const assetPath = url.pathname === '/' ? '/index.html' : url.pathname;
        const file = path.resolve(root, './admin' + assetPath);
        if (file.startsWith(path.resolve(root, 'admin') + '/') && fs.existsSync(file) && fs.statSync(file).isFile()) {
          route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
        } else route.fulfill({ status: 404, body: '' });
      } else route.abort();
    });
    await remoteAdmin.goto('https://cms-auth.aravindakrishnan.cloud/');
    await remoteAdmin.getByText(/Sign In with.*GitHub/).waitFor();
    assert.equal(await remoteAdmin.getByText('There is an error in the CMS configuration.').count(), 0);
    assert.ok(remoteRequests.some(url => /sveltia-cms-0\.209\.0\.js/.test(url)));
    assert.ok(remoteRequests.some(url => /config\.yml/.test(url)));
    await remoteAdmin.close();
    console.log('Admin local, public-inert and remote configuration: PASS');

    const page = await browser.newPage();
    await page.route('**/__visitor', route => route.abort());
    await page.goto(origin + '/'); await page.waitForTimeout(300);
    assert.equal(await page.locator('#visitor-count').innerText(), '····');
    for (const file of ['feed.xml', 'sitemap.xml']) {
      const xml = fs.readFileSync(path.join(root, file), 'utf8');
      assert.equal(await page.evaluate(text => new DOMParser().parseFromString(text, 'application/xml').querySelectorAll('parsererror').length, xml), 0, file + ': XML');
    }
    await page.close();
    console.log('Counter stub success/failure and feed/sitemap XML: PASS');
    fs.writeFileSync(path.join(evidence, 'browser-results.json'), JSON.stringify(results, null, 2) + '\n');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
