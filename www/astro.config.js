import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://unlike.dev",
  integrations: [sitemap()],
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
    server: {
      https: {
        key: "../localhost+6-key.pem",
        cert: "../localhost+6.pem",
      },
    },
  },
});
