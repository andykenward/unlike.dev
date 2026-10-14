import AxeBuilder from "@axe-core/playwright";
import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend<{ makeAxeBuilder: () => AxeBuilder }>({
  // Shared axe configuration, so every accessibility scan checks the same rules.
  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
      ]),
    );
  },
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
