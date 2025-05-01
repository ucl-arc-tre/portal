import path from "path";

import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainEslintConfig = path.join(__dirname, "..", "eslint.config.mjs");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const patchedConfig = fixupConfigRules([...compat.extends(mainEslintConfig)]);

const cypressConfig = [
  ...patchedConfig,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
];

export default cypressConfig;
