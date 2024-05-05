import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://unlike.dev",
  integrations: [tailwind(), sitemap()],
  compressHTML: true,
});
