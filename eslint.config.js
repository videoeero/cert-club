// `typescript-eslint` (and its parser/plugin) refuse to run at all against
// TypeScript >=7 — see https://github.com/typescript-eslint/typescript-eslint/issues/10940.
// This repo's `tsc` is TS 7 (aliased via the `@typescript/native` devDependency
// for speed), so `package.json` also aliases a TS 6 build in under the plain
// `typescript` name specifically so `require("typescript")` resolves to
// something `typescript-eslint` supports. Building/typechecking still use the
// real TS 7 `tsc`; only this lint config's type-aware parsing goes through
// the aliased TS 6. Remove the alias once the upstream issue above is fixed.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "certs", "coverage"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["vite.config.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        project: ["./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      sourceType: "module",
    },
  },
  eslintConfigPrettier,
);
