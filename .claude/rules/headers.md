---
paths:
  - "www/public/_headers"
  - "tests/headers.spec.ts"
---

# Response headers (`www/public/_headers`)

- `server.js` (`pnpm run serve`) and the Astro dev server ignore `_headers`. Playwright and Lighthouse both start `pnpm run serve:pages` (`wrangler pages dev`) locally, which applies it, so `pnpm test` runs `tests/headers.spec.ts` against the real rules and local Lighthouse audits the real headers. Update that spec when changing `_headers`.
- `serve:pages` must stay HTTPS (`--local-protocol https`): over plain HTTP, WebKit applies `upgrade-insecure-requests` to localhost and `page.goto` times out. It uses wrangler's self-signed certificate, not the mkcert ones; Playwright has `ignoreHTTPSErrors`.
- Outside CI, Playwright reuses whatever is already listening on `:4321`. If `pnpm run serve` is running there, the header tests fail because that server sends no headers.
- The emulator logs `[ERROR] ... Broken pipe` when Playwright stops it. That is shutdown noise, not a test failure.
- The emulator only reproduces Pages. Zone-level behaviour on `unlike.dev` still needs `pnpm run test:site` or `curl`.
- Production does not match the file for every header. As of Oct 2026 `unlike.dev` returns `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: same-origin`, `X-XSS-Protection` and `Expect-CT`, which looks like a zone-level Cloudflare setting (probably the "Add security headers" managed transform; not confirmed in the dashboard). HSTS is also set by the zone. Check with `curl -sI https://unlike.dev/` before assuming a file change took effect. The spec skips those headers on `unlike.dev` for this reason.
- The CSP nonce is static, so it adds no protection of its own, but keep it: Cloudflare's bot-detection (`/cdn-cgi/challenge-platform/...`) reuses the nonce from the header for the inline script it injects. It must match the `nonce` in `www/src/layouts/Layout.astro`.
- Do not add `'strict-dynamic'` to `script-src`: Cloudflare injects `/cdn-cgi/scripts/.../email-decode.min.js` without a nonce and it would be blocked. It only becomes possible if email obfuscation is turned off in Cloudflare.
- The analytics script loads from `static.cloudflareinsights.com` and reports to `cloudflareinsights.com`; `script-src` and `connect-src` list those separately.
- Rules from every matching block are combined, so a header set in two of them is sent twice: on `*.pages.dev`, `/_astro/*` responses carry `X-Robots-Tag: none, none`. The emulator only matches the path rule, so this shows up on CI but not locally.
- `*.pages.dev` previews serve the file's `X-Frame-Options` and `Referrer-Policy` unmodified (confirmed by CI on PR #360); only the `unlike.dev` zone overrides them.
- A `! Header` line detaches a header inherited from `/*`; a header with the same name can be set again in the same block (as `/_astro/*` does with `Cache-Control`).
