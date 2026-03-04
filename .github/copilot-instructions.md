# Unlike.dev Copilot Instructions

## Project Overview

This is a company portfolio website built with **Astro 5**, deployed to **Cloudflare Pages**. It's a pnpm monorepo with the main site in `www/` and root-level tooling (ESLint, Prettier, Playwright tests).

## Architecture

### Monorepo Structure

- **Root**: Shared tooling, local dev server ([server.js](../server.js)), E2E tests
- **www/**: Astro application with all site content and components

### Content Management

Uses **Astro Content Collections** ([www/src/content.config.ts](../www/src/content.config.ts)) with file-system loader:

- `clients/` - Client logos with `sortOrder`, `asset`, `href`, `title`
- `social/` - Social media links (same schema as clients)
- `tags/` - Technology tags organized by category folders (css/, framework/, language/, platform/, react/, testing/, tool/)
- `open-source/` - Open source project showcases

Content files are markdown with frontmatter. Images are imported from `src/assets/` using Astro's image schema.

## Development Workflows

### Local Development

```bash
# From root - starts HTTPS dev server on port 4321
cd www && pnpm run dev

# Or use the local HTTP/2 preview server
pnpm run serve  # Serves www/dist on https://localhost:4321
```

**Critical**: Local dev uses mkcert certificates (`localhost+6.pem`, `localhost+6-key.pem`) for HTTPS. Both Astro dev server ([www/astro.config.js](../www/astro.config.js)) and preview server ([server.js](../server.js)) expect these at root.

### Building

```bash
pnpm --filter www build  # Runs astro check + astro build
```

### Testing

Playwright tests run against the built site:

```bash
pnpm run pretest  # Builds www
pnpm run test     # Runs against https://localhost:4321
pnpm run test:site  # Runs against production
```

Tests use client certificates for local HTTPS ([playwright.config.ts](../playwright.config.ts#L39-L46)).

### Linting & Formatting

- **ESLint**: Astro + jsx-a11y-strict plugins, Playwright rules for test files
- **Prettier**: Auto-sorts imports, supports Astro/Tailwind/packagejson plugins
- **Husky + lint-staged**: Runs Prettier on all staged files pre-commit

Run manually:

```bash
pnpm run lint           # ESLint with cache
pnpm run prettier       # Format all files
```

## Project Conventions

### Styling

- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- No traditional config file - uses CSS `@theme` directives
- Dark mode via `dark:` variants (respects system preference)
- Fonts: Atkinson Hyperlegible (body), Righteous (headings)

### Components

All components are `.astro` files in `www/src/components/`. They fetch content via `getCollection()` and render with Tailwind classes. See [Clients.astro](../www/src/components/Clients.astro) for the pattern:

1. Fetch collection
2. Sort by `sortOrder` (descending)
3. Map to semantic HTML with accessibility attributes

### Assets

- Optimized SVGs in `src/assets/icons/` and `src/assets/svgs/logos/`
- Run `pnpm --filter www run svgo:icons` or `svgo:svgs` to optimize
- Import via frontmatter `asset` field using Astro's image helper

### Security & Deployment

- CSP headers in [www/public/\_headers](../www/public/_headers) (Cloudflare Pages format)
- GitHub Actions workflow deploys on push to `main` and PRs
- Uses custom action `andykenward/github-actions-cloudflare-pages`
- Post-build: Playwright tests run against deployed preview URL

## Key Files Reference

- [www/src/content.config.ts](../www/src/content.config.ts) - Content collection schemas
- [www/src/config.ts](../www/src/config.ts) - Site-wide constants (title, description, email)
- [www/src/pages/index.astro](../www/src/pages/index.astro) - Homepage structure
- [eslint.config.js](../eslint.config.js) - Flat config with Astro + Playwright plugins
- [playwright.config.ts](../playwright.config.ts) - Test setup with HTTPS client certs

## Common Tasks

**Add a new client**: Create `www/src/content/clients/name.md` with frontmatter:

```md
---
sortOrder: 10
asset: "../../assets/svgs/logos/client-name.svg"
href: "https://example.com/"
title: "Client Name"
---
```

**Add technology tag**: Create in appropriate subfolder under `www/src/content/tags/`, e.g., `tags/framework/nextjs.md` with `title` and `href`.

**Update dependencies**: Use `pnpm update` - lockfile uses `minimumReleaseAge: 1440` (24 hours) and only builds `esbuild` and `sharp` from source.
