import type { OxlintOverride } from "vite-plus/lint";

export const voidProjectJsPlugins = [
  { name: "typed-fetch", specifier: "./tooling/lint/typed-fetch.ts" },
  {
    name: "void-pages-routing",
    specifier: "./tooling/lint/void-pages-routing.ts",
  },
  {
    name: "void-forms",
    specifier: "./tooling/lint/void-forms.ts",
  },
] as const;

export const voidProjectRules = {
  "eslint/no-restricted-globals": [
    "error",
    { name: "fetch", message: "Import fetch from void/client." },
  ],
  "eslint/no-restricted-properties": [
    "error",
    {
      object: "process",
      property: "env",
      message: "Import env from void/env.",
    },
  ],
  "typed-fetch/require-typed-fetch": "error",
  "void-pages-routing/page-server-exports": "error",
  "void-pages-routing/static-page-layout": "error",
  "void-forms/no-success-flag-effect": "error",
} satisfies NonNullable<OxlintOverride["rules"]>;
