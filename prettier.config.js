/** @type {import("prettier").Config} */
const config = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
    "prettier-plugin-packagejson",
  ],
  importOrderTypeScriptVersion: "5.0.0",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

export default config;
