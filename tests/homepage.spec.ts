import { expect, test, type Page } from "@playwright/test";

/* Tailwind's `sm` (40rem) and `md` (48rem) are the only breakpoints in the
 * built CSS, and `max-w-screen-2xl` caps the content at 96rem. One width per
 * layout; the default 1280px viewport is covered by "homepage snapshot". */
const BREAKPOINTS = [
  { name: "base", width: 375 },
  { name: "sm", width: 640 },
  { name: "md", width: 768 },
  { name: "2xl", width: 1920 },
] as const;

/* Most images are lazy, so scroll each one into view and wait for it to load;
 * otherwise a full-page screenshot can capture empty boxes. */
const loadAllImages = async (page: Page) => {
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    await expect(img).toHaveJSProperty("complete", true);
  }
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle(
    /Unlike - Full Stack Application Engineering/i,
  );
});

test("sets the document language and metadata", async ({ page }) => {
  const title = "Unlike - Full Stack Application Engineering";
  const description =
    "Full Stack application engineering. Based in London, England.";

  await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description,
  );

  for (const prefix of ["og", "twitter"]) {
    const meta = (name: string) =>
      page.locator(`meta[property="${prefix}:${name}"]`);

    await expect(meta("title")).toHaveAttribute("content", title);
    await expect(meta("description")).toHaveAttribute("content", description);
    // Built from Astro's `site`, so always the production origin.
    await expect(meta("url")).toHaveAttribute("content", "https://unlike.dev/");
    await expect(meta("image")).toHaveAttribute(
      "content",
      "https://unlike.dev/hotlink-ok/social.jpg",
    );
  }
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[property="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("serves the social image and favicon", async ({ request }) => {
  const image = await request.get("/hotlink-ok/social.jpg");
  await expect(image).toBeOK();
  expect(image.headers()["content-type"]).toBe("image/jpeg");

  const favicon = await request.get("/hotlink-ok/favicon.svg");
  await expect(favicon).toBeOK();
  expect(favicon.headers()["content-type"]).toContain("image/svg+xml");
});

test("links to the contact email in the header and footer", async ({
  page,
}) => {
  const linkEmail = page
    .getByRole("main")
    .getByRole("link", { name: "hi@unlike.dev" });

  await expect(linkEmail).toBeVisible();
  await expect(linkEmail).toHaveAttribute("href", "mailto:hi@unlike.dev");

  const linkEmailFooter = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "hi@unlike.dev" });

  await expect(linkEmailFooter).not.toBeInViewport();
  await expect(linkEmailFooter).toHaveAttribute("href", "mailto:hi@unlike.dev");
});

test("links to LinkedIn", async ({ page }) => {
  const linkLinkedIn = page
    .getByRole("main")
    .getByRole("link", { name: "LinkedIn" });

  await expect(linkLinkedIn).toBeVisible();
  await expect(linkLinkedIn).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/andykenward/",
  );
});

test("links to social profiles in order", async ({ page }) => {
  // The icon links, not the "GitHub" entry in the skills list.
  const social = page
    .getByRole("main")
    .getByRole("link", { name: /^(LinkedIn|GitHub)$/ })
    .filter({ has: page.getByRole("img") });

  await expect(social).toHaveCount(2);
  await expect(social.first()).toHaveAccessibleName("LinkedIn");
  await expect(social.last()).toHaveAccessibleName("GitHub");
  await expect(social.last()).toHaveAttribute(
    "href",
    "https://github.com/andykenward",
  );
  for (const link of await social.all()) {
    await expect(link).toHaveAttribute("rel", "noreferrer nofollow");
    await expect(link.getByRole("img")).toBeVisible();
  }
});

test("shows header", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Unlike", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

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
});

test("preconnects to the analytics origin", async ({ page }) => {
  const preconnect = page.locator(
    'head link[rel="preconnect"][href="https://static.cloudflareinsights.com"]',
  );

  await expect(preconnect).toHaveCount(1);
  // Must match the beacon script's CORS mode or the connection is not reused.
  await expect(preconnect).toHaveAttribute("crossorigin", "anonymous");
  await expect(
    page.locator('script[src^="https://static.cloudflareinsights.com/"]'),
  ).toHaveAttribute("crossorigin", "anonymous");
});

test("prioritises the first row of client logos", async ({ page }) => {
  const logos = page
    .getByRole("list", { name: "Experience:" })
    .getByRole("img");

  // The first logo is the Largest Contentful Paint element.
  await expect(logos.first()).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator('img[fetchpriority="high"]')).toHaveCount(1);

  for (const index of [0, 1, 2]) {
    await expect(logos.nth(index)).toHaveAttribute("loading", "eager");
  }
  await expect(logos.nth(3)).toHaveAttribute("loading", "lazy");
  await expect(logos.last()).toHaveAttribute("loading", "lazy");
});

test("lists clients, most recent first, as external links", async ({
  page,
}) => {
  const links = page
    .getByRole("list", { name: "Experience:" })
    .getByRole("link");

  await expect(links.first()).toHaveAccessibleName(
    "Starling Bank | Award-winning bank accounts.",
  );
  await expect(links.filter({ hasText: "Google" }).first()).toHaveAttribute(
    "href",
    "https://www.google.com/",
  );

  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\//);
    await expect(link).toHaveAttribute("rel", "noreferrer nofollow");
    await expect(link).not.toHaveAttribute("target");

    // Explicit dimensions stop the grid shifting while logos load.
    const logo = link.getByRole("img");
    await expect(logo).toHaveAttribute("alt", / Logo$/);
    await expect(logo).toHaveAttribute("width", /^\d+$/);
    await expect(logo).toHaveAttribute("height", /^\d+$/);
  }
});

test("lists open source projects", async ({ page }) => {
  const link = page
    .getByRole("list", { name: "Open Source:" })
    .getByRole("link", { name: "GitHub Action Cloudflare Pages" });

  await expect(link).toHaveAttribute(
    "href",
    "https://github.com/andykenward/github-actions-cloudflare-pages",
  );
  await expect(link).toHaveAttribute("rel", "noreferrer nofollow");
  await expect(link.getByRole("img")).toHaveAttribute(
    "alt",
    "GitHub Action Cloudflare Pages Logo",
  );
});

test("lists skills without legacy technologies", async ({ page }) => {
  const skills = page.getByRole("list", { name: "Skills:" });
  const links = skills.getByRole("link");

  // Languages are the first group.
  await expect(
    skills.getByRole("link", { name: "TypeScript", exact: true }),
  ).toBeVisible();
  await expect(links.first()).toHaveAccessibleName(
    /^(JavaScript|TypeScript|HTML|Node\.js|REST)$/,
  );

  // Everything under tags/legacy/ is hidden.
  for (const name of ["Angular", "Backbone.js", "Marionette", "Three.js"]) {
    await expect(skills.getByRole("link", { name, exact: true })).toHaveCount(
      0,
    );
  }

  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\//);
    await expect(link).toHaveAttribute("rel", "noreferrer nofollow");
  }
});

test("section headings link to their own anchors", async ({ page }) => {
  for (const [name, id] of [
    ["Experience:", "experience"],
    ["Open Source:", "open-source"],
    ["Skills:", "skills"],
  ]) {
    const heading = page.getByRole("heading", { name, level: 2 });

    await heading.getByRole("link", { name }).click();

    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(heading).toBeInViewport();
  }
});

test("shows the company registration in the footer", async ({ page }) => {
  await expect(
    page
      .getByRole("contentinfo")
      .getByText(
        "Unlike Ltd is a company registered in England and Wales (No. 14026435).",
      ),
  ).toBeVisible();
});

test("loads every image", async ({ page }) => {
  const images = page.getByRole("img");

  await expect(images).not.toHaveCount(0);
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
    // A broken image is "complete" too, but has no intrinsic size.
    await expect(img).not.toHaveJSProperty("naturalWidth", 0);
  }
});

test("loads without script errors or failed same-origin requests", async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? page.url()).origin;
  const problems: string[] = [];

  // A fresh tab, so the listeners are attached before the first request.
  const tab = await page.context().newPage();
  tab.on("pageerror", (error) => {
    // The analytics beacon is refused away from unlike.dev, and WebKit
    // reports that CORS failure as a page error.
    if (!error.message.includes("cloudflareinsights.com")) {
      problems.push(`pageerror: ${error.message}`);
    }
  });
  tab.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === origin) {
      problems.push(`failed: ${request.url()}`);
    }
  });
  tab.on("response", (response) => {
    if (new URL(response.url()).origin === origin && response.status() >= 400) {
      problems.push(`${response.status()}: ${response.url()}`);
    }
  });

  await tab.goto("/");
  for (const img of await tab.getByRole("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveJSProperty("complete", true);
  }

  expect(problems).toEqual([]);
});

test.describe("on a small screen", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("fits the viewport without horizontal scrolling", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Unlike", level: 1 }),
    ).toBeInViewport();

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      )
      .toBe(0);
  });
});

test("uses a dark background with light text in dark mode", async ({
  page,
}) => {
  const body = page.locator("body");

  await expect(body).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.emulateMedia({ colorScheme: "dark" });

  await expect(body).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(body).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("homepage snapshot", async ({ page }) => {
  const link = page.getByRole("link", {
    name: "GitHub Action Cloudflare Pages",
  });
  await expect(link).toBeVisible();

  await loadAllImages(page);

  await expect(page).toHaveScreenshot("homepage.png", { fullPage: true });
});

for (const { name, width } of BREAKPOINTS) {
  test.describe(`at the ${name} breakpoint (${width}px)`, () => {
    test.use({ viewport: { width, height: 720 } });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`viewport snapshot in ${colorScheme} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await loadAllImages(page);
        // Capture what the browser window shows at this width, from the top.
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(
          page.getByRole("heading", { name: "Unlike", level: 1 }),
        ).toBeInViewport();

        await expect(page).toHaveScreenshot(
          `homepage-${name}-${colorScheme}.png`,
        );
      });
    }
  });
}
