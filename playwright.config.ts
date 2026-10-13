import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* e.g. tests/screenshots/homepage-chromium.png */
  snapshotPathTemplate: "{testDir}/screenshots/{arg}-{projectName}{ext}",
  /* Baselines are rendered in the CI Playwright container, where font rendering
   * differs from local machines. Regenerate them with the Deploy workflow's
   * "update-snapshots" input. */
  ignoreSnapshots: !process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    serviceWorkers: "block",
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "https://localhost:4321",
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      "CF-Access-Client-Id": process.env.CLOUDFLARE_ACCESS_CLIENT_ID || "",
      "CF-Access-Client-Secret":
        process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET || "",
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    clientCertificates: process.env.PLAYWRIGHT_TEST_BASE_URL
      ? undefined
      : [
          {
            origin: "https://localhost:4321",
            certPath: "localhost+6.pem",
            keyPath: "localhost+6-key.pem",
          },
        ],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /* Reduce font rasterisation differences between machines. */
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-lcd-text",
            "--disable-font-subpixel-positioning",
          ],
        },
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Serve www/dist with the Cloudflare Pages emulator, which applies
   * www/public/_headers like a deployment does. */
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: "pnpm run serve:pages",
        env: { WRANGLER_SEND_METRICS: "false" },
        ignoreHTTPSErrors: true,
        url: "https://localhost:4321/",
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },
});
