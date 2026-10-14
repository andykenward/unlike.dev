import { expect, test } from "./fixtures";

/* Every page, in both colour schemes: contrast differs between them. */
for (const path of ["/", "/404"]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${path} has no accessibility violations in ${colorScheme} mode`, async ({
      page,
      makeAxeBuilder,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);

      const results = await makeAxeBuilder().analyze();

      expect(results.violations).toEqual([]);
    });
  }
}
