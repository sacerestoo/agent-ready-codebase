import type { OxlintOverride } from "vite-plus/lint";
import { commonPlugins } from "./common";

export const reactJsPlugins = [
  { name: "react-codebase", specifier: "./tooling/lint/react-naming.ts" },
] as const;

export const reactLint = {
  plugins: [...commonPlugins, "react", "jsx-a11y"],
  rules: {
    // Turn off to allow empty JSX elements to use separate opening and closing tags.
    "react/self-closing-comp": "error",
    // Turn off to allow components that are not named default function exports.
    "react-codebase/component-default-export": "error",
    // Turn off to allow custom hooks without a use prefix.
    "react-codebase/custom-hook-name": "error",
    "react-codebase/non-jsx-function-export-const": "error",
    // Turn off to allow callback props without an on prefix.
    "react-codebase/callback-prop-name": "error",
    // Turn off to allow inline or non-handle component event handlers.
    "react-codebase/component-handler-name": "error",
    // Turn off to allow array positions to be used as React keys.
    "react/no-array-index-key": "error",
    // Turn off to allow hooks with missing or extra dependencies.
    "react/exhaustive-deps": "error",
    // Turn off to allow interactive click handlers without keyboard support.
    "jsx-a11y/click-events-have-key-events": "error",
    // Turn off to allow labels without a linked form control.
    "jsx-a11y/label-has-associated-control": "error",
    // Turn off to allow images without alternative text.
    "jsx-a11y/alt-text": "error",
  },
} satisfies Omit<OxlintOverride, "files">;
