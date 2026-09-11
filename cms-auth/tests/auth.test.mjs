import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import worker from "../src/index.js";

const env = {
  ALLOWED_DOMAINS: "cms-auth.aravindakrishnan.cloud",
  GITHUB_CLIENT_ID: "test-client-id",
  GITHUB_CLIENT_SECRET: "test-client-secret",
};

const request = (path, options) => new Request(`https://cms-auth.aravindakrishnan.cloud${path}`, options);

test("worker asset build contains the CMS and Cloudflare headers", () => {
  for (const file of ["index.html", "bootstrap.js", "config.yml", "sveltia-cms-0.209.0.js", "_headers"]) {
    assert.equal(existsSync(new URL(`../.worker-assets/${file}`, import.meta.url)), true, file);
  }
});

test("allows only the portfolio hostname and requests public_repo", async () => {
  const response = await worker.fetch(request("/auth?provider=github&site_id=cms-auth.aravindakrishnan.cloud&scope=public_repo"), env);

  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("Location"));
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.pathname, "/login/oauth/authorize");
  assert.equal(location.searchParams.get("client_id"), "test-client-id");
  assert.equal(location.searchParams.get("scope"), "public_repo");
  assert.match(response.headers.get("Set-Cookie"), /csrf-token=github_[0-9a-f]{32}/);

  for (const scope of ["", "repo", "repo,user", "public_repo,user"]) {
    const scoped = await worker.fetch(request(`/auth?provider=github&site_id=cms-auth.aravindakrishnan.cloud&scope=${encodeURIComponent(scope)}`), env);
    assert.equal(new URL(scoped.headers.get("Location")).searchParams.get("scope"), "public_repo");
  }

  const denied = await worker.fetch(request("/auth?provider=github&site_id=www.aravindakrishnan.cloud"), env);
  assert.equal(denied.status, 200);
  assert.match(await denied.text(), /UNSUPPORTED_DOMAIN/);
  const gitlab = await worker.fetch(request("/auth?provider=gitlab&site_id=cms-auth.aravindakrishnan.cloud"), env);
  assert.match(await gitlab.text(), /UNSUPPORTED_BACKEND/);

  const missingAllowlist = await worker.fetch(
    request("/auth?provider=github&site_id=cms-auth.aravindakrishnan.cloud"),
    { GITHUB_CLIENT_ID: "test-client-id", GITHUB_CLIENT_SECRET: "test-client-secret" },
  );
  assert.match(await missingAllowlist.text(), /UNSUPPORTED_DOMAIN/);
});

test("rejects callback CSRF mismatches without exchanging a token", async () => {
  const originalFetch = globalThis.fetch;
  let exchanged = false;
  globalThis.fetch = async () => {
    exchanged = true;
    return new Response(JSON.stringify({ access_token: "unexpected" }));
  };

  try {
    const response = await worker.fetch(
      request("/callback?code=code&state=wrong", { headers: { Cookie: "csrf-token=github_0123456789abcdef0123456789abcdef" } }),
      env,
    );
    assert.equal(response.status, 200);
    assert.match(await response.text(), /CSRF_DETECTED/);
    assert.equal(exchanged, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("exchanges a callback code only after the matching CSRF check", async () => {
  const originalFetch = globalThis.fetch;
  let tokenRequest;
  globalThis.fetch = async (url, options) => {
    tokenRequest = { url, options };
    return new Response(JSON.stringify({ access_token: "test-token" }));
  };

  try {
    const state = "0123456789abcdef0123456789abcdef";
    const response = await worker.fetch(
      request(`/callback?code=code&state=${state}`, { headers: { Cookie: `csrf-token=github_${state}` } }),
      env,
    );
    assert.equal(tokenRequest.url, "https://github.com/login/oauth/access_token");
    assert.deepEqual(JSON.parse(tokenRequest.options.body), {
      code: "code",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
    });
    const html = await response.text();
    const nonce = /<script nonce="([0-9a-f]{32})">/.exec(html)?.[1];
    assert.match(html, /test-token/);
    assert.ok(nonce);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Pragma"), "no-cache");
    assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.equal(response.headers.get("Content-Security-Policy"), `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`);
    assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("token delivery rejects untrusted opener origins", () => {
  const source = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.match(source, /if \(hasToken && !isTrusted\(origin\)\)/);
  assert.doesNotMatch(source, /hasToken && trustedPatterns\.length/);
});
