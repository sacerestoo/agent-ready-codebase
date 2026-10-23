import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import type { ArchitectureConfig } from "../types.ts";
import { checkArchitectureShape } from "../check.ts";

const roots: string[] = [];

function createRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "architecture-check-"));
  roots.push(root);
  writeFileSync(join(root, "package.json"), JSON.stringify({ private: true }));
  return root;
}

const nonVoidDirectories = {
  pages: "src/routes",
  routes: "src/api",
  features: "src/features",
  shared: "src/shared",
} as const;

const nonVoidArchitecture: ArchitectureConfig<typeof nonVoidDirectories> = {
  directories: nonVoidDirectories,
  applicationDirectoryKeys: ["pages", "routes", "features", "shared"],
  webDirectoryKeys: ["pages", "routes", "features", "shared"],
  databaseModulePathPatterns: [],
  databaseImporterPathPatterns: [],
  sourceExtensions: [".ts", ".vue"],
  additionalRootDirectories: ["docs", "tooling"],
  generatedDirectories: [".git", "node_modules", "dist"],
  featureSubdirectories: ["__tests__", "components"],
  featureUi: { directory: "components", extensions: [".vue"] },
  singletonFiles: [],
  packageManifest: "package.json",
  rejectWorkspaces: true,
  cssDirectory: "src/styles",
  dependencyCruiserConfig: ".dependency-cruiser.ts",
  typeScriptConfig: "tsconfig.json",
};

afterEach((): void => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("checkArchitectureShape", (): void => {
  it("checks a configured non-Void source layout", (): void => {
    const root = createRoot();
    mkdirSync(join(root, "src/features/tasks/components"), {
      recursive: true,
    });
    writeFileSync(
      join(root, "src/features/tasks/components/task-list.vue"),
      "export {}",
    );

    expect(checkArchitectureShape(root, nonVoidArchitecture)).toEqual([]);
  });

  it("rejects unapproved folders and UI file types from the config", (): void => {
    const root = createRoot();
    mkdirSync(join(root, "src/features/tasks/nested"), {
      recursive: true,
    });
    mkdirSync(join(root, "src/features/tasks/components"), { recursive: true });
    mkdirSync(join(root, "unexpected"));
    writeFileSync(
      join(root, "src/features/tasks/components/task-list.ts"),
      "export {}",
    );

    expect(checkArchitectureShape(root, nonVoidArchitecture)).toEqual([
      "Remove unapproved root directories: unexpected.",
      "Remove unapproved feature directories: tasks/nested.",
      expect.stringMatching(/Keep feature UI source files as \.vue/u),
    ]);
  });
});
