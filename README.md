# Unlike

Source for [unlike.dev](https://unlike.dev), the website of Unlike Ltd. Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), hosted on [Cloudflare Pages](https://pages.cloudflare.com).

## Requirements

- Node `^24.10.0`
- pnpm `^10.12.4`
- [mkcert](https://github.com/FiloSottile/mkcert) for local HTTPS

The included [dev container](.devcontainer/devcontainer.json) sets all of this up, plus Playwright browsers and Claude Code.

## Getting started

```bash
pnpm install

# Local HTTPS certificates, read by the dev server, preview server and tests
mkcert -install
mkcert -cert-file localhost+6.pem -key-file localhost+6-key.pem localhost 127.0.0.1 ::1

cd www && pnpm run dev    # https://localhost:4321
```

## Commands

Run from the repo root.

| Command                   | Action                                               |
| :------------------------ | :--------------------------------------------------- |
| `pnpm --filter www build` | Type-check and build the site to `www/dist`          |
| `pnpm run serve`          | Serve the built site over HTTP/2 on `localhost:4321` |
| `pnpm run lint`           | Lint with ESLint                                     |
| `pnpm run prettier`       | Format with Prettier                                 |
| `pnpm test`               | Build, serve and run the Playwright tests            |
| `pnpm run test:ui`        | Run the Playwright tests in UI mode                  |
| `pnpm run test:site`      | Run the Playwright tests against https://unlike.dev  |

## Content

Site content lives in [Astro content collections](www/src/content.config.ts) under [`www/src/content/`](www/src/content/): clients, social links, technology tags and open-source projects. Each entry is a Markdown file with frontmatter only; logos and icons live in [`www/src/assets/`](www/src/assets/).

## Deployment

The [Deploy workflow](.github/workflows/deploy.yml) builds every pull request to a Cloudflare Pages preview and every push to `main` to production, then runs the Playwright tests against the deployed URL. Previews are removed when the pull request closes.

### Screenshot baselines

Screenshot comparisons only run on CI, where fonts render consistently. To regenerate the baselines after a visual change, run the Deploy workflow on your branch with **update-snapshots** ticked:

```bash
gh workflow run deploy.yml --ref <branch> -f update-snapshots=true
```

The workflow commits the new images to the branch.

## Working with coding agents

Instructions for coding agents (Claude Code, Copilot, Codex, etc.) are in [AGENTS.md](AGENTS.md).
