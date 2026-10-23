import tailwindcss from "@tailwindcss/vite";
import { voidReact } from "@void/react/plugin";
import { defineConfig, type ViteUserConfig } from "vite-plus";
import { voidPlugin } from "void";
import { webSourceGlobs } from "./tooling/architecture/paths.ts";
import {
  commonJsPlugins,
  commonLintCategories,
  commonLintOptions,
  commonPlugins,
  commonRuleOverrides,
  commonRules,
} from "./tooling/lint/common";
import { webLint } from "./tooling/lint/web";

const config: ViteUserConfig = {
  test: {
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
  fmt: {
    semi: true,
    singleQuote: false,
    printWidth: 80,
    jsxSingleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    endOfLine: "lf",
    insertFinalNewline: true,
    singleAttributePerLine: true,
    proseWrap: "always",
    sortPackageJson: {
      sortScripts: true,
    },
    sortTailwindcss: {
      // Tailwind class sorting reads the project's stylesheet and helpers.
      stylesheet: "./styles/globals.css",
      functions: ["cn", "clsx"],
    },
    sortImports: {
      newlinesBetween: false,
      internalPattern: ["@/**"],
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
  },
  lint: {
    plugins: [...commonPlugins],
    jsPlugins: [...commonJsPlugins],
    categories: commonLintCategories,
    rules: commonRules,
    options: commonLintOptions,
    overrides: [
      {
        files: webSourceGlobs,
        ...webLint,
      },
      ...commonRuleOverrides,
    ],
  },
  run: {
    cache: true,
  },
  staged: {
    "*": "vp check --fix",
  },
};

function getPlugins(mode: string) {
  if (mode === "test") return [];
  return [
    voidPlugin(),
    voidReact({ react: { compiler: true }, viewTransitions: true }),
    tailwindcss(),
  ];
}

export default defineConfig(({ mode }) => ({
  ...config,
  plugins: getPlugins(mode),
}));
