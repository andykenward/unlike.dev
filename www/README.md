# www

The Astro site for [unlike.dev](https://unlike.dev). Setup, testing and deployment are covered in the [root README](../README.md).

## Structure

```
www/
├── public/            # Static files; _headers sets security headers (CSP) on Cloudflare Pages
└── src/
    ├── assets/        # Icons and logo SVGs, referenced from content frontmatter
    ├── components/    # One component per content collection
    ├── content/       # Markdown entries for each collection
    ├── layouts/
    ├── pages/         # index, 404 and robots.txt
    ├── styles/        # global.css with Tailwind @theme tokens
    ├── config.ts      # Site title, description and email
    └── content.config.ts  # Collection schemas
```

## Commands

Run from `www/`, or from the root with `pnpm --filter www <command>`.

| Command               | Action                                            |
| :-------------------- | :------------------------------------------------ |
| `pnpm run dev`        | Start the dev server on https://localhost:4321    |
| `pnpm run build`      | Type-check (`astro check`) and build to `dist/`   |
| `pnpm run preview`    | Preview the build on https://localhost:4321       |
| `pnpm run tsc:check`  | Type-check TypeScript and JavaScript with `tsc`   |
| `pnpm run svgo:icons` | Optimise the SVGs in `src/assets/icons/` in place |
| `pnpm run svgo:svgs`  | Optimise the SVGs in `src/assets/svgs/` in place  |

## Adding content

Add a Markdown file to the matching folder in `src/content/`. It has frontmatter only, and the fields must satisfy the schema in `content.config.ts`. For example, a client:

```md
---
sortOrder: 10
asset: "../../assets/svgs/logos/client-name.svg"
href: "https://example.com/"
title: "Client Name"
---
```

Tags under `src/content/tags/legacy/` are kept but not shown on the site.
