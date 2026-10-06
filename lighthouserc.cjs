// @ts-check
const { chromium } = require("@playwright/test");

/* Audit a deployed URL when set, otherwise serve and audit the local www/dist. */
const BASE_URL = process.env.LIGHTHOUSE_BASE_URL;

module.exports = {
  ci: {
    collect: {
      url: [`${BASE_URL || "https://localhost:4321"}/`],
      startServerCommand: BASE_URL ? undefined : "pnpm run serve",
      numberOfRuns: 3,
      /* Reuse the Chromium that Playwright installs. */
      chromePath: chromium.executablePath(),
      settings: {
        chromeFlags: [
          "--headless=new",
          "--no-sandbox",
          /* Without this the tab crashes in containers with a small /dev/shm. */
          "--disable-dev-shm-usage",
          BASE_URL ? "" : "--ignore-certificate-errors",
        ].join(" "),
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "lighthouse-report",
    },
  },
};
