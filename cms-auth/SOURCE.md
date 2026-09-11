# Sveltia CMS Authenticator source

`vendor/index.js` is the unmodified upstream Sveltia CMS Authenticator source.

- Upstream repository: https://github.com/sveltia/sveltia-cms-auth
- Upstream commit: `449b1d357e0173491d453749ed2e4507fef6399a`
- Upstream path: `src/index.js`
- Upstream SHA-256: `a2858897152ffda6652e060f12f4976183879ae8baec6d00e60957f2ea802985`
- License: MIT, copied in `LICENSE.txt`

`src/index.js` is the deployed downstream copy. It supports GitHub only and always requests
`public_repo`. It fails closed when `ALLOWED_DOMAINS` is missing, refuses to send a token to
an untrusted opener, and adds no-store, referrer, content-type and nonce-based CSP headers to
callback responses. Its SHA-256 is
`b553bc400385ff63eada7750d4215d1e00b06dba7de2eabed1ec7f3f7072623e`.

Review changes with:

```bash
diff -u cms-auth/vendor/index.js cms-auth/src/index.js
```

Update both copies only after selecting and reviewing a new upstream commit. Record both
checksums and keep the downstream security changes or replace them with equivalent upstream
fixes.
