import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    cspViolations: string[];
  }
}

/* The unlike.dev zone replaces some headers with its own values, so the ones
 * below can only be asserted on *.pages.dev deployments. */
const isProduction =
  new URL(process.env.PLAYWRIGHT_TEST_BASE_URL || "https://localhost")
    .hostname === "unlike.dev";

const parseCsp = (csp: string) =>
  new Map(
    csp.split(";").map((directive): [string, string[]] => {
      const [name = "", ...values] = directive.trim().split(/\s+/);
      return [name, values];
    }),
  );

test("sends the content security policy", async ({ page }) => {
  const response = await page.goto("/");
  const csp = parseCsp(
    (await response?.headerValue("content-security-policy")) ?? "",
  );

  // Soft, so one run reports every directive that is wrong.
  expect.soft(csp.get("default-src"), "default-src").toEqual(["'self'"]);
  expect.soft(csp.get("object-src"), "object-src").toEqual(["'none'"]);
  expect.soft(csp.get("base-uri"), "base-uri").toEqual(["'self'"]);
  expect.soft(csp.get("form-action"), "form-action").toEqual(["'self'"]);
  expect
    .soft(csp.get("frame-ancestors"), "frame-ancestors")
    .toEqual(["'none'"]);
  expect
    .soft(csp.has("upgrade-insecure-requests"), "upgrade-insecure-requests")
    .toBe(true);
  expect
    .soft(csp.get("connect-src"), "connect-src")
    .toEqual(["'self'", "https://cloudflareinsights.com"]);

  const scriptSrc = csp.get("script-src") ?? [];
  expect.soft(scriptSrc).toContain("'self'");
  expect.soft(scriptSrc).toContain("https://static.cloudflareinsights.com");
  expect.soft(scriptSrc).not.toContain("'unsafe-inline'");
  expect.soft(scriptSrc).not.toContain("'unsafe-eval'");

  // The nonce in _headers must match the one on the beacon script in
  // Layout.astro. Browsers hide the attribute, so read the property.
  const nonce = scriptSrc
    .find((source) => source.startsWith("'nonce-"))
    ?.slice("'nonce-".length, -1);
  expect(nonce, "script-src nonce").toBeTruthy();
  await expect(
    page.locator('script[src^="https://static.cloudflareinsights.com/"]'),
  ).toHaveJSProperty("nonce", nonce);
});

test("does not violate the content security policy", async ({ page }) => {
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.cspViolations.push(
        `${event.effectiveDirective}: ${event.blockedURI}`,
      );
    });
  });

  await page.goto("/");
  // The analytics beacon reports when the page is hidden, so give it the
  // chance to hit connect-src.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
});

test("sends the security headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();

  expect.soft(headers["x-content-type-options"]).toBe("nosniff");
  expect.soft(headers["cross-origin-opener-policy"]).toBe("same-origin");

  const permissionsPolicy = headers["permissions-policy"] ?? "";
  for (const feature of [
    "accelerometer",
    "autoplay",
    "camera",
    "display-capture",
    "geolocation",
    "gyroscope",
    "magnetometer",
    "microphone",
    "midi",
    "payment",
    "usb",
  ]) {
    expect.soft(permissionsPolicy).toContain(`${feature}=()`);
  }
});

test("sends the headers the production zone overrides", async ({ request }) => {
  test.skip(isProduction, "the unlike.dev zone sets its own values");

  const headers = (await request.get("/")).headers();

  expect.soft(headers["x-frame-options"]).toBe("DENY");
  expect
    .soft(headers["referrer-policy"])
    .toBe("strict-origin-when-cross-origin");
  expect.soft(headers["x-xss-protection"]).toBeUndefined();
});

test("caches hashed assets without the document headers", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const stylesheet = page.locator('link[rel="stylesheet"]').first();
  await expect(stylesheet).toHaveAttribute("href", /^\/_astro\//);

  const response = await request.get(
    (await stylesheet.getAttribute("href")) ?? "",
  );
  await expect(response).toBeOK();
  const headers = response.headers();

  expect
    .soft(headers["cache-control"])
    .toBe("public, max-age=31536000, immutable");
  expect.soft(headers["x-robots-tag"]).toBe("none");
  expect.soft(headers["content-security-policy"]).toBeUndefined();
  expect.soft(headers["permissions-policy"]).toBeUndefined();
});

test("does not cache the 404 page as immutable", async ({ request }) => {
  for (const path of ["/404", "/404.html"]) {
    const response = await request.get(path, { maxRedirects: 0 });

    expect
      .soft(response.headers()["cache-control"] ?? "", path)
      .not.toContain("immutable");
  }
});
