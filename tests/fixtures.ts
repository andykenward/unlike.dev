import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend({
  // Keep test runs out of Cloudflare Web Analytics. The beacon script still
  // loads, so the CSP test keeps covering it; only its report is dropped.
  context: async ({ context }, use) => {
    await context.route("https://cloudflareinsights.com/**", (route) =>
      route.abort(),
    );
    await use(context);
  },
});
