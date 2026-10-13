import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend({
  // Keep test runs out of Cloudflare Web Analytics. Block the script, not
  // its report: Firefox and WebKit send the final report (Core Web Vitals)
  // while the context closes, after routes are detached.
  context: async ({ context }, use) => {
    await context.route("https://static.cloudflareinsights.com/**", (route) =>
      route.abort(),
    );
    await use(context);
  },
});
