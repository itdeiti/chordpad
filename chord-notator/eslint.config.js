import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  // Build / tool config files are loaded by ecosystem tools (Vite, Vitest, …)
  // that require a default export by contract. The default-export ban applies
  // only to application code under src/.
  {
    files: [
      "vite.config.ts",
      "vitest.config.ts",
      "postcss.config.js",
      "tailwind.config.js",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    settings: {
      // Hardcoded version to avoid eslint-plugin-react's auto-detect path,
      // which currently fails on ESLint 10 (the plugin officially supports
      // up to ESLint 9).
      react: { version: "19" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Enforce the agreed convention: components are arrow consts, not function
      // declarations. Applies to both named (`const X = () => …`) and unnamed
      // components (rare in this codebase).
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      // Block accidental regressions to default exports. The codebase is
      // entirely on named exports as of the convention refactor.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Default exports are disallowed — use a named export (`export const X = …`).",
        },
      ],
    },
  },
);
