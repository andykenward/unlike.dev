// @ts-check

import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginPlaywright from "eslint-plugin-playwright";

export default [
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  {
    ...eslintPluginPlaywright.configs["flat/recommended"],
    files: ["tests/**/*.spec.ts"],
    rules: {
      ...eslintPluginPlaywright.configs["flat/recommended"].rules,
      "playwright/no-conditional-expect": "error",
    },
  },
];
