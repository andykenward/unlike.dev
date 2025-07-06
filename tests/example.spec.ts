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
