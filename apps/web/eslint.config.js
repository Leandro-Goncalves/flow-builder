import { nextJsConfig } from "@react-flowkit/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [".next/**", "dist/**"],
  },
  ...nextJsConfig,
];
