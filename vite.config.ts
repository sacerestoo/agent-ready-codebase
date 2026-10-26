import tailwindcss from "@tailwindcss/vite";
import { voidReact } from "@void/react/plugin";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type ViteUserConfig } from "vite-plus";
import { voidPlugin } from "void";
import {
  createLintConfig,
  type LintProfileSelection,
} from "./tooling/lint/profiles.ts";

const enabledLintProfiles = {
  react: true,
  vitePlus: true,
  voidProject: true,
  tanstackQuery: true,
} as const satisfies LintProfileSelection;

const betterAuthEmailOTPClientResolver = {
  name: "better-auth-email-otp-client-resolver",
  enforce: "pre" as const,
  resolveId: {
    order: "pre" as const,
    handler(source: string) {
      if (source !== "better-auth/client/plugins") return null;
      return fileURLToPath(import.meta.resolve(source));
    },
  },
};

const config: ViteUserConfig = {
  test: {
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  environments: {
    void_worker: {
      resolve: { noExternal: ["better-auth"] },
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
  lint: createLintConfig(enabledLintProfiles),
  run: {
    cache: true,
  },
  staged: {
    "*.{js,jsx,ts,tsx,json,jsonc,css,md,mdx}": "vp fmt",
  },
};

function getPlugins(mode: string) {
  if (mode === "test") return [];
  return [
    betterAuthEmailOTPClientResolver,
    voidPlugin(),
    voidReact({ react: { compiler: true }, viewTransitions: true }),
    tailwindcss(),
  ];
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const webhookHost = env.CREEM_WEBHOOK_HOST;

  return {
    ...config,
    server: {
      allowedHosts: webhookHost ? [webhookHost] : [],
    },
    plugins: getPlugins(mode),
  };
});
