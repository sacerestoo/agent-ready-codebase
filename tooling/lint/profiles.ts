import type { ViteUserConfig } from "vite-plus";
import {
  architectureDirectories,
  sourceFileGlobs,
  webSourceGlobs,
} from "../architecture/paths.ts";
import {
  commonJsPlugins,
  commonLintCategories,
  commonLintOptions,
  commonPlugins,
  commonRuleOverrides,
  commonRules,
} from "./common";
import { reactJsPlugins, reactLint } from "./react";
import { tanstackQueryJsPlugins, tanstackQueryRules } from "./tanstack-query";
import { vitePlusJsPlugins, vitePlusRules } from "./vite-plus";
import { voidProjectJsPlugins, voidProjectRules } from "./void-project.ts";

export type LintProfileSelection = Readonly<{
  react: boolean;
  vitePlus: boolean;
  voidProject: boolean;
  tanstackQuery: boolean;
}>;

export function createLintConfig(selection: LintProfileSelection) {
  return {
    plugins: [...commonPlugins],
    jsPlugins: [
      ...commonJsPlugins,
      ...(selection.react ? reactJsPlugins : []),
      ...(selection.vitePlus ? vitePlusJsPlugins : []),
      ...(selection.voidProject ? voidProjectJsPlugins : []),
      ...(selection.tanstackQuery ? tanstackQueryJsPlugins : []),
    ],
    categories: commonLintCategories,
    rules: {
      ...commonRules,
      ...(selection.vitePlus ? vitePlusRules : {}),
      ...(selection.voidProject ? voidProjectRules : {}),
      ...(selection.tanstackQuery ? tanstackQueryRules : {}),
    },
    options: commonLintOptions,
    overrides: [
      ...(selection.react ? [{ files: webSourceGlobs, ...reactLint }] : []),
      ...(selection.react
        ? [
            {
              files: sourceFileGlobs([`${architectureDirectories.shared}/ui`]),
              rules: {
                "react-codebase/component-default-export": "off" as const,
              },
            },
          ]
        : []),
      {
        files: ["pages/layout.tsx"],
        rules: {
          "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
        },
      },
      ...commonRuleOverrides,
    ],
  } satisfies NonNullable<ViteUserConfig["lint"]>;
}
