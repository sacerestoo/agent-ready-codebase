import type { OxlintOverride } from "vite-plus/lint";
import {
  applicationDirectoryGlobs,
  applicationSourceGlobs,
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
  { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
  { name: "@tanstack/query", specifier: "@tanstack/eslint-plugin-query" },
  { name: "query", specifier: "./tooling/lint/query.ts" },
  { name: "typed-fetch", specifier: "./tooling/lint/typed-fetch.ts" },
  { name: "testing", specifier: "./tooling/lint/testing.ts" },
  { name: "void-naming", specifier: "./tooling/lint/naming.ts" },
] as const;

export const commonLintOptions = { typeAware: true, typeCheck: true } as const;

export const commonLintCategories = {
  // Turn off to disable Oxlint's built-in correctness rule group.
  correctness: "error",
  // Turn off to disable stricter rules that may have occasional false positives.
  pedantic: "error",
  // Turn off to disable rules for code that is likely wrong or useless.
  suspicious: "error",
} as const;

export const commonRules = {
  // Turn off to allow project-specific imports instead of Vite+ imports.
  "vite-plus/prefer-vite-plus-imports": "error",
  // Turn off to allow JavaScript source files.
  "void-naming/no-javascript-files": "error",
  // Type aliases, interfaces, and generic parameters must use PascalCase.
  "void-naming/pascal-case-types": "error",
  // Test files must use the Vite+ test APIs.
  "testing/require-vite-plus-test": "error",
  // Unit and E2E test filenames use distinct suffixes.
  "testing/require-test-filename": "error",
  // Turn off to allow unused variables and imports.
  "eslint/no-unused-vars": ["error", { args: "all", caughtErrors: "all" }],
  // Turn off to allow duplicate imports from the same module.
  "eslint/no-duplicate-imports": "error",
  // Turn off to allow native global fetch instead of Void's typed client.
  "eslint/no-restricted-globals": [
    "error",
    { name: "fetch", message: "Import fetch from void/client." },
  ],
  // Environment variables must be read through the schema-backed Void env.
  "eslint/no-restricted-properties": [
    "error",
    {
      object: "process",
      property: "env",
      message: "Import env from void/env.",
    },
  ],
  // Turn off to allow type imports without the `type` keyword.
  "typescript/consistent-type-imports": "error",
  // Unknown values cannot be changed before they are narrowed to a concrete type.
  "typescript/prefer-readonly-parameter-types": [
    "error",
    {
      allow: ["unknown", "Readonly", "WeakSet"],
      ignoreInferredTypes: true,
    },
  ],
  // Turn off to allow imports that create dependency cycles.
  "import/no-cycle": "error",
  // Turn off to allow explicit `any` types.
  "typescript/no-explicit-any": "error",
  // Turn off to allow assigning to function parameters.
  "eslint/no-param-reassign": "error",
  // Turn off to allow multiple variables in one declaration.
  "eslint/one-var": ["error", "never"],
  // Turn off to allow default parameters before required parameters.
  "eslint/default-param-last": "error",
  // Turn off to allow literal assertions that could use `as const`.
  "typescript/prefer-as-const": "error",
  // Turn off to allow unnecessary template strings.
  "typescript/no-unnecessary-template-expression": "error",
  // Turn off to allow global Number functions such as parseInt.
  "unicorn/prefer-number-properties": "error",
  // Turn off to allow filenames that are not lowercase.
  "unicorn/filename-case": ["error", { case: "lowercase" }],
  // Turn off to allow console output other than warnings and errors.
  "no-console": ["error", { allow: ["warn", "error"] }],
  // Query keys must include values used to fetch their data.
  "@tanstack/query/exhaustive-deps": "error",
  // Query clients must keep the same instance between renders.
  "@tanstack/query/stable-query-client": "error",
  // Query results should only subscribe to fields the component uses.
  "@tanstack/query/no-rest-destructuring": "error",
  // React hook dependencies should use fields, not the whole query result.
  "@tanstack/query/no-unstable-deps": "error",
  // Query functions must return the data that should be cached.
  "@tanstack/query/no-void-query-fn": "error",
  // Mutation callback order keeps its types inferable.
  "@tanstack/query/mutation-property-order": "error",
  // Shared query options keep each key tied to its query function.
  "@tanstack/query/prefer-query-options": "error",
  // Query keys must come from imported factories instead of inline values.
  "query/no-hardcoded-query-keys": "error",
  // API calls must use Void's route-typed fetch client.
  "typed-fetch/require-typed-fetch": "error",
  // Fetch errors must be caught and narrowed to Void's FetchError type.
  "typed-fetch/require-fetch-error-handling": "error",
} satisfies NonNullable<OxlintOverride["rules"]>;

export const commonRuleOverrides = [
  {
    files: applicationSourceGlobs,
    rules: {
      // Turn off to allow enums in app source.
      "void-naming/no-enum": "error",
      // Turn off to allow enum members without explicit values in app source.
      "typescript/prefer-enum-initializers": "error",
      // Turn off to allow else branches instead of early returns in app source.
      "void-naming/no-else": "error",
      // Turn off to allow functions without explicit return types in app code.
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
    rules: {
      // Turn off to allow identifiers that are not camelCase in app source.
      "void-naming/camel-case-identifiers": "error",
    },
  },
] satisfies OxlintOverride[];
