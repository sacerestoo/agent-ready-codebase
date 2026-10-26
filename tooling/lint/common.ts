import type { OxlintOverride } from "vite-plus/lint";
import {
  architectureDirectories,
  applicationDirectoryGlobs,
  applicationSourceGlobs,
  featureUiSourceGlobs,
  webSourceGlobs,
} from "../architecture/paths.ts";

export const commonPlugins = [
  "eslint",
  "typescript",
  "oxc",
  "unicorn",
  "promise",
  "import",
] as const;

export const commonJsPlugins = [
  { name: "codebase", specifier: "./tooling/lint/naming.ts" },
  { name: "testing", specifier: "./tooling/lint/testing.ts" },
] as const;

export const commonLintOptions = { typeAware: true, typeCheck: true } as const;

export const commonLintCategories = {
  correctness: "error",
  pedantic: "error",
  suspicious: "error",
} as const;

export const commonRules = {
  "codebase/no-javascript-files": "error",
  "codebase/pascal-case-types": "error",
  "testing/require-test-filename": "error",
  "eslint/no-useless-catch": "error",
  "eslint/no-unused-vars": ["error", { args: "all", caughtErrors: "all" }],
  "eslint/no-duplicate-imports": "error",
  "typescript/no-floating-promises": ["error", { ignoreVoid: true }],
  "typescript/no-misused-promises": "error",
  "typescript/strict-void-return": "error",
  "typescript/consistent-type-imports": "error",
  "typescript/prefer-readonly-parameter-types": [
    "error",
    {
      allow: ["unknown", "Readonly", "WeakSet"],
      ignoreInferredTypes: true,
    },
  ],
  "import/no-cycle": "error",
  "typescript/no-explicit-any": "error",
  "eslint/no-param-reassign": "error",
  "eslint/one-var": ["error", "never"],
  "eslint/default-param-last": "error",
  "typescript/prefer-as-const": "error",
  "typescript/no-unnecessary-template-expression": "error",
  "unicorn/prefer-number-properties": "error",
  "unicorn/filename-case": ["error", { case: "lowercase" }],
  "no-console": ["error", { allow: ["warn", "error"] }],
} satisfies NonNullable<OxlintOverride["rules"]>;

export const commonRuleOverrides = [
  {
    files: webSourceGlobs,
    rules: {
      "typescript/no-non-null-assertion": "error",
      "typescript/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
        },
      ],
    },
  },
  {
    files: featureUiSourceGlobs,
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },
  {
    files: applicationSourceGlobs,
    rules: {
      "codebase/no-enum": "error",
      "typescript/prefer-enum-initializers": "error",
      "codebase/no-else": "error",
      "typescript/explicit-function-return-type": [
        "error",
        {
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
        },
      ],
    },
  },
  {
    files: applicationDirectoryGlobs,
    rules: { "codebase/camel-case-identifiers": "error" },
  },
  {
    files: [`${architectureDirectories.shared}/ui/**/*.tsx`],
    rules: {
      "typescript/explicit-function-return-type": "off",
      "typescript/prefer-readonly-parameter-types": "off",
      "typescript/strict-boolean-expressions": [
        "error",
        { allowNullableBoolean: true },
      ],
      "eslint/eqeqeq": ["error", "always", { null: "ignore" }],
      "eslint/max-lines-per-function": ["error", 70],
    },
  },
] satisfies OxlintOverride[];
