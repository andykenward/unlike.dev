import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(
    /Unlike - Full Stack Application Engineering/i,
  );
});

test("get email link", async ({ page }) => {
  const linkEmail = page
    .getByRole("main")
    .getByRole("link", { name: "hi@unlike.dev" });

  await expect(linkEmail).toBeVisible();
  await expect(linkEmail).toHaveAttribute("href", "mailto:hi@unlike.dev");

  await expect(
    page.getByRole("heading", { name: "Unlike", level: 1 }),
  ).toBeVisible();

  const linkEmailFooter = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "hi@unlike.dev" });

  await expect(linkEmailFooter).not.toBeInViewport();
  await expect(linkEmailFooter).toHaveAttribute("href", "mailto:hi@unlike.dev");
});

test("get linkedin", async ({ page }) => {
  const linkLinkedIn = page
    .getByRole("main")
    .getByRole("link", { name: "LinkedIn" });

  await expect(linkLinkedIn).toBeVisible();
  await expect(linkLinkedIn).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/andykenward/",
  );
});

test("shows header", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Unlike", level: 1 }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Full Stack application engineering.",
      level: 2,
    }),
  ).toBeVisible();

  const name = page.getByRole("heading", { name: "By Andy Kenward", level: 3 });
  await expect(name).toBeVisible();
  const nameLink = name.getByRole("link", { name: "Andy Kenward" });
  await expect(nameLink).toBeVisible();
  await expect(nameLink).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/andykenward/",
  );
  await expect(nameLink).toHaveAttribute("rel", "noreferrer nofollow");
  await expect(nameLink).not.toHaveAttribute("target");

  await expect(
    page.getByRole("heading", { level: 4, name: "London, England" }),
  ).toBeVisible();
  const email = page
    .getByRole("main")
    .getByRole("link", { name: "hi@unlike.dev" });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("href", "mailto:hi@unlike.dev");
});

test("homepage snapshot", async ({ page, browserName }, testInfo) => {
  const link = page.getByRole("link", {
    name: "GitHub Action Cloudflare Pages",
  });
  await expect(link).toBeVisible();

  const img = link.locator("img");
  await img.scrollIntoViewIfNeeded();
  await img.waitFor({ state: "visible" });

  await expect(img).toHaveJSProperty("complete", true);

  const screenshot = await page.screenshot({
    fullPage: true,
    path: `tests/screenshots/homepage-${browserName}.png`,
  });

  await testInfo.attach("homepage-screenshot", {
    body: screenshot,
    contentType: "image/png",
  });
});
