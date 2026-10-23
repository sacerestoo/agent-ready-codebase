import type { ArchitectureConfig } from "./types.ts";

const directories = {
  pages: "pages",
  routes: "routes",
  features: "features",
  shared: "shared",
  middleware: "middleware",
  crons: "crons",
  queues: "queues",
  db: "db",
} as const;

export const architecture = {
  directories,
  applicationDirectoryKeys: [
    "pages",
    "routes",
    "features",
    "shared",
    "middleware",
    "crons",
    "queues",
    "db",
  ],
  webDirectoryKeys: ["pages", "routes", "features", "shared"],
  databaseModulePathPatterns: ["^node_modules/void/.*/db[.]"],
  databaseImporterPathPatterns: ["^routes/api/[^/]+/"],
  sourceExtensions: [".ts", ".tsx"],
  additionalRootDirectories: [
    ".audit",
    ".github",
    ".vite-hooks",
    "docs",
    "outputs",
    "styles",
    "tooling",
  ],
  generatedDirectories: [".git", ".void", ".wrangler", "dist", "node_modules"],
  featureSubdirectories: ["__tests__", "ui"],
  featureUi: {
    directory: "ui",
    extensions: [".tsx"],
  },
  singletonFiles: [
    {
      name: "Void config",
      expectedPath: "void.config.ts",
      prefix: "void.config.",
      extensions: [".js", ".cjs", ".mjs", ".ts", ".cts", ".mts"],
    },
  ],
  packageManifest: "package.json",
  rejectWorkspaces: true,
  cssDirectory: "styles",
  dependencyCruiserConfig: ".dependency-cruiser.ts",
  typeScriptConfig: "tsconfig.json",
} satisfies ArchitectureConfig<typeof directories>;
