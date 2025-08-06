import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["out/**", "node_modules/**", ".next/**", "dist/**", "cypress/**", "cypress.config.ts", "src/openapi/**"],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  }),
];

export default eslintConfig;
