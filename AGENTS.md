# AGENTS.md

This file provides guidance to coding agents (Claude Code, Copilot, etc.) when working with code in this repository.

Unlike Ltd's single-page portfolio site ([unlike.dev](https://unlike.dev)): Astro 7 + Tailwind CSS 4, deployed to Cloudflare Pages. A pnpm workspace with the site in `www/`; the root holds tooling (ESLint, Prettier, Playwright, local HTTPS server).

## Commands

Run from the repo root unless noted.

```bash
pnpm --filter www build   # astro check + astro build → www/dist
cd www && pnpm run dev    # HTTPS dev server on https://localhost:4321
pnpm run serve            # HTTP/2 server for the built www/dist on :4321
pnpm run lint             # ESLint (whole repo, cached)
pnpm run prettier         # format everything
pnpm test                 # builds www (pretest), serves it, runs Playwright
pnpm run test:site        # Playwright against production
pnpm run lighthouse       # builds www, serves it, runs Lighthouse CI (3 runs)
pnpm run lighthouse:site  # Lighthouse CI against production

# Single test (build www first; the webServer only serves www/dist)
pnpm exec playwright test -g "has title" --project=chromium
```

Local HTTPS needs mkcert certs `localhost+6.pem` / `localhost+6-key.pem` in the repo root; the Astro dev server, `server.js` and `playwright.config.ts` all read them. The devcontainer's `postCreateCommand` generates `localhost.pem` instead, so those names won't match if you regenerate.

## Architecture

- **Content** lives in Astro content collections (`www/src/content.config.ts`): `clients`, `social`, `tags` (grouped into category folders), `open-source`. Each is a folder of frontmatter-only `.md` files; the schema is the source of truth for required fields (e.g. `tags` needs `sortOrder`, `title`, `href`). `asset` fields are paths into `www/src/assets/` validated with Astro's `image()`.
- **Components** in `www/src/components/` each render one collection via `getCollection()`. Sorting isn't uniform: `Clients` sorts by `sortOrder` descending, `Header` (social) and `Technology` (tags) ascending, `OpenSource` not at all. `Technology` hides everything under `tags/legacy/`. `www/src/pages/index.astro` composes them; site constants are in `www/src/config.ts`.
- **SVGs** go in `www/src/assets/icons/` or `www/src/assets/svgs/`; optimise with `pnpm --filter www run svgo:icons` / `svgo:svgs`.
- **Styling** is Tailwind CSS 4 via `@tailwindcss/vite`, with no `tailwind.config`: theme tokens are `@theme` in `www/src/styles/global.css`.
- **Security headers** (CSP etc.) are in `www/public/_headers` (Cloudflare Pages format). Adding external resources means updating the CSP there.

## CI and screenshot baselines

`.github/workflows/deploy.yml` runs the pre-commit hooks (`prek run --all-files`), builds, deploys to Cloudflare Pages (preview on PRs, production on `main`), then runs Playwright against the deployed URL in the `mcr.microsoft.com/playwright` container matching the installed `@playwright/test` version. `delete.yml` removes preview deployments when a PR closes.

Lighthouse (`lighthouserc.cjs`) is local-only, using Playwright's Chromium (no separate Chrome install); it fails below the category scores asserted there and writes HTML reports to `lighthouse-report/`. It was deliberately left out of CI (Oct 2026): every `*.pages.dev` deployment sits behind Cloudflare Access, and Lighthouse both copies the Access headers into its reports and sends them to third-party origins. Gotchas when reading results:

- On `unlike.dev` itself Cloudflare injects scripts that are not in this repo (`/cdn-cgi/challenge-platform/...` bot detection, `email-decode.min.js`). They lower Lighthouse best practices to about 82, so `pnpm run lighthouse:site` fails the 90 threshold; changing that is a Cloudflare dashboard setting, not a code fix.
- The local server (`server.js`) does not compress responses, so ignore "Enable text compression" in local reports.
- Playwright sends the Access headers on every request, third parties included, so on CI the Cloudflare Web Analytics beacon fails its CORS preflight and logs a console error. That is an artefact of the test setup, not a site bug.

Screenshot comparisons only run on CI (`ignoreSnapshots: !process.env.CI`), because font rendering differs locally. Never regenerate baselines locally. To update them, push the branch and run:

```bash
gh workflow run deploy.yml --ref <branch> -f update-snapshots=true
```

The `commit-snapshots` job commits the new `tests/screenshots/*.png` to the branch as a signed commit, so pull afterwards.

## Conventions

- Conventional Commits: `feat:`, `fix:`, `chore(deps):`, `test:`, `ci:`.
- [prek](https://prek.j178.dev) Git hooks are defined in `prek.toml`. Pre-commit: guards (no commits on `main`, merge markers, large files, private keys), svgo on staged SVGs, Prettier (sorts imports), ESLint, actionlint and zizmor (`.github/zizmor.yml`). Commit-msg: commitlint. Pre-push: `astro check`. If a hook rewrites a file the commit aborts, so re-stage and commit again.
- `prek` is a dev dependency (`@j178/prek`); `pnpm i` installs the Git shims via `prepare` (skipped on CI). Remote hooks are pinned to commit SHAs with a `# frozen: vX.Y.Z` comment (`prek auto-update --freeze`).
- Dependencies: `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`, so packages published in the last 24h won't install. Only `esbuild` and `sharp` may run build scripts.
- TypeScript is held at 6.x (tried 7.0.2 in Oct 2026): `astro check` refuses TS 7 and `@typescript-eslint/parser` requires `<6.1.0`, so the build and lint both fail. Recheck [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940) and `@astrojs/check`'s peer range before bumping.
- ESLint a11y rules (`astro/jsx-a11y/*`) need `eslint-plugin-jsx-a11y-x`, the ESLint 10-compatible fork of `eslint-plugin-jsx-a11y`. `eslint-plugin-astro` loads it implicitly, so it is never imported in `eslint.config.js`; don't remove it as unused.
- GitHub Actions are pinned to commit SHAs with a `#vX.Y.Z` comment; keep that format when bumping.

## Rules

Path-scoped conventions live in `.claude/rules/*.md`.

| Rule | Paths | Covers |
| ---- | ----- | ------ |
