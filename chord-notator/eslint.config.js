import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
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
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintReact.configs["recommended-typescript"],
    ],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Default exports are disallowed — use a named export (`export const X = …`).",
        },
        // Approximates the old `react/function-component-definition` rule
        // (which @eslint-react doesn't ship): ban capitalised function
        // declarations as a proxy for "components must be arrow consts".
        // Catches `function Button() {}` by name convention; misses unnamed
        // function components, which are rare here.
        {
          selector: "FunctionDeclaration[id.name=/^[A-Z]/]",
          message:
            "Components must be arrow consts (`const X = () => …`), not function declarations.",
        },
      ],
    },
  },
);
