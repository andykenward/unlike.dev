---
paths:
  - "tests/**/*.spec.ts"
  - "playwright.config.ts"
---

# Playwright specs

- Screenshot names are `tests/screenshots/{name}-{project}.png`. A new `toHaveScreenshot` name has no baseline, so CI fails until the Deploy workflow is run with `update-snapshots=true` on the branch. Comparison is skipped locally, so a local pass says nothing about screenshots.
- `homepage.png` is a full-page capture at the default 1280px viewport. The per-breakpoint captures (`homepage-{base,sm,md,2xl}-{light,dark}.png`) are also full-page: the breakpoint's viewport width, the whole page height. The breakpoint list in `tests/homepage.spec.ts` mirrors the media queries in the built CSS; update it when a new Tailwind breakpoint is used.
- Most images are `loading="lazy"`. Scroll each into view and wait for `complete` (the `loadAllImages` helper) before any screenshot.
- Set dark mode with `page.emulateMedia({ colorScheme: "dark" })`. `test.use({ colorScheme: "dark" })` in a `describe` left the Firefox project in light mode (Playwright 1.63).
- `toHaveText` with a regex does not normalise whitespace, and Astro leaves whitespace inside links. Use `toHaveAccessibleName` or a string.
- A link name can match in more than one section (for example "GitHub" is both a social icon and a skills entry). Scope by list, or filter by `has`.
- Away from `unlike.dev` the analytics beacon is refused, and WebKit reports that CORS failure as a `pageerror`. Filter `cloudflareinsights.com` when asserting on page errors.
- To catch requests from the first page load, attach listeners to a fresh tab before `goto`. `beforeEach` has already navigated, and a `page.reload()` reports the previous load's lazy image requests as failed in Firefox and WebKit.
