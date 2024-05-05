const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        brand: ["Righteous"],
        sans: ["Atkinson Hyperlegible", ...defaultTheme.fontFamily.sans],
      },
      invert: {
        40: ".4",
        60: ".6",
      },
      supports: {
        cq: "container-type: inline-size",
        "not-cq": "not(container-type: inline-size)",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};

module.exports = config;
