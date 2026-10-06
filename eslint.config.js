// @ts-check

import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginPlaywright from "eslint-plugin-playwright";

export default [
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  {
    ...eslintPluginPlaywright.configs["flat/recommended"],
    files: ["tests/**/*.spec.ts"],
    languageOptions: {
      ...eslintPluginPlaywright.configs["flat/recommended"].languageOptions,
      parser: tsParser,
    },
    rules: {
      ...eslintPluginPlaywright.configs["flat/recommended"].rules,
      "playwright/no-conditional-expect": "error",
      /* Skips with a condition are deliberate, e.g. tests that need a deployed URL. */
      "playwright/no-skipped-test": ["warn", { allowConditional: true }],
    },
  },
];
