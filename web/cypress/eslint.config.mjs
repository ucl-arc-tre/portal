import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cypressConfig = {
  extends: path.join(__dirname, "..", ".eslintrc.mjs"),

  rules: {
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
  },
};

export default cypressConfig;
