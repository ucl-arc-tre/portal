import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      "out/",
      "node_modules/",
      ".next/",
      "dist/",
      "cypress/",
      "cypress.config.ts",
      "src/openapi/",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    settings: {
      // Explicitly pinned. See: https://github.com/vercel/next.js/issues/89764
      react: { version: "19" },
    },
  },
]);

export default eslintConfig;
