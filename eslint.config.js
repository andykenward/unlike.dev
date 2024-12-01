import eslintPluginAstro from "eslint-plugin-astro";

export default [
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
];
