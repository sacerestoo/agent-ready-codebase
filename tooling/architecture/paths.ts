export const architectureDirectories = {
  pages: "pages",
  routes: "routes",
  features: "features",
  shared: "shared",
  middleware: "middleware",
  crons: "crons",
  queues: "queues",
  db: "db",
} as const;

export const generatedDirectories = [
  ".git",
  ".void",
  ".wrangler",
  "dist",
  "node_modules",
] as const;

export const rootDirectories = [
  ".audit",
  ".github",
  ".vite-hooks",
  ".void",
  ".wrangler",
  "db",
  "dist",
  "features",
  "middleware",
  "node_modules",
  "outputs",
  "pages",
  "routes",
  "shared",
  "styles",
  "tooling",
] as const;

export const featureSubdirectories = ["__tests__", "ui"] as const;

export const rootPackageManifest = "package.json" as const;
export const rootVoidConfig = "void.config.ts" as const;
export const voidConfigPrefix = "void.config." as const;
export const voidConfigExtensions = [
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".cts",
  ".mts",
] as const;
export const dependencyCruiserConfig = ".dependency-cruiser.ts" as const;
export const rootTypeScriptConfig = "tsconfig.json" as const;

export const applicationDirectories = [
  architectureDirectories.pages,
  architectureDirectories.routes,
  architectureDirectories.features,
  architectureDirectories.shared,
  architectureDirectories.middleware,
  architectureDirectories.crons,
  architectureDirectories.queues,
  architectureDirectories.db,
] as const;
export const webDirectories = [
  architectureDirectories.pages,
  architectureDirectories.routes,
  architectureDirectories.features,
  architectureDirectories.shared,
] as const;

export function sourceFileGlobs(directories: readonly string[]): string[] {
  return directories.flatMap((directory) => [
    `${directory}/**/*.ts`,
    `${directory}/**/*.tsx`,
  ]);
}

export function directoryGlobs(directories: readonly string[]): string[] {
  return directories.map((directory) => `${directory}/**`);
}

export const applicationSourceGlobs = sourceFileGlobs(applicationDirectories);
export const applicationDirectoryGlobs = directoryGlobs(applicationDirectories);
export const webSourceGlobs = sourceFileGlobs(webDirectories);
