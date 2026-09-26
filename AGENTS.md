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

`.github/workflows/deploy.yml` lints, builds, deploys to Cloudflare Pages (preview on PRs, production on `main`), then runs Playwright against the deployed URL in the `mcr.microsoft.com/playwright` container matching the installed `@playwright/test` version. `delete.yml` removes preview deployments when a PR closes.

Screenshot comparisons only run on CI (`ignoreSnapshots: !process.env.CI`), because font rendering differs locally. Never regenerate baselines locally. To update them, push the branch and run:

```bash
gh workflow run deploy.yml --ref <branch> -f update-snapshots=true
```

The `commit-snapshots` job commits the new `tests/screenshots/*.png` to the branch as a signed commit, so pull afterwards.

## Conventions

- Conventional Commits: `feat:`, `fix:`, `chore(deps):`, `test:`, `ci:`.
- Husky pre-commit runs Prettier on staged files via lint-staged. Prettier sorts imports.
- Dependencies: `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440`, so packages published in the last 24h won't install. Only `esbuild` and `sharp` may run build scripts.
- GitHub Actions are pinned to commit SHAs with a `#vX.Y.Z` comment; keep that format when bumping.

## Rules

Path-scoped conventions live in `.claude/rules/*.md`.

| Rule | Paths | Covers |
| ---- | ----- | ------ |
