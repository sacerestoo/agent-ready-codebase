import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { ArchitectureConfig } from "./types.ts";

function findProjectFiles(
  directory: string,
  generatedDirectories: Readonly<Set<string>>,
  matches: (fileName: string) => boolean,
): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return generatedDirectories.has(entry.name)
        ? []
        : findProjectFiles(path, generatedDirectories, matches);
    }

    return matches(entry.name) ? [path] : [];
  });
}

function findUnapprovedRootDirectories(
  root: string,
  config: ArchitectureConfig,
  generatedDirectories: Readonly<Set<string>>,
): string[] {
  const allowed = new Set([
    ...Object.values(config.directories).map((path) => path.split(/[\\/]/u)[0]),
    ...config.additionalRootDirectories,
  ]);
  return readdirSync(root, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !generatedDirectories.has(entry.name) &&
        !allowed.has(entry.name),
    )
    .map((entry) => entry.name);
}

function findUnapprovedFeatureDirectories(
  root: string,
  config: ArchitectureConfig,
): string[] {
  const featuresRoot = join(root, config.directories.features);
  if (!existsSync(featuresRoot)) return [];
  const allowed = new Set(config.featureSubdirectories);
  return readdirSync(featuresRoot, { withFileTypes: true })
    .filter((feature) => feature.isDirectory())
    .flatMap((feature) =>
      readdirSync(join(featuresRoot, feature.name), { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !allowed.has(entry.name))
        .map((entry) => `${feature.name}/${entry.name}`),
    );
}

function findInvalidFeatureUiFiles(
  root: string,
  config: ArchitectureConfig,
  generatedDirectories: Readonly<Set<string>>,
): string[] {
  const featuresRoot = join(root, config.directories.features);
  if (!existsSync(featuresRoot)) return [];
  const { directory, extensions } = config.featureUi;
  return readdirSync(featuresRoot, { withFileTypes: true })
    .filter((feature) => feature.isDirectory())
    .flatMap((feature) => {
      const uiDirectory = join(featuresRoot, feature.name, directory);
      if (!existsSync(uiDirectory)) return [];
      return findProjectFiles(
        uiDirectory,
        generatedDirectories,
        (fileName) => fileName !== ".gitkeep",
      )
        .filter(
          (path) => !extensions.some((extension) => path.endsWith(extension)),
        )
        .map((path) => relative(root, path));
    });
}

function findPackageErrors(
  root: string,
  config: ArchitectureConfig,
  generatedDirectories: Readonly<Set<string>>,
): string[] {
  const packagePath = join(root, config.packageManifest);
  const packageFiles = findProjectFiles(
    root,
    generatedDirectories,
    (fileName) => fileName === config.packageManifest,
  );
  const errors: string[] = [];
  if (packageFiles.some((path) => path !== packagePath)) {
    errors.push(`Keep ${config.packageManifest} at the repository root only.`);
  }
  if (!existsSync(packagePath) || !config.rejectWorkspaces) return errors;

  const packageJson: unknown = JSON.parse(readFileSync(packagePath, "utf8"));
  if (
    typeof packageJson === "object" &&
    packageJson !== null &&
    "workspaces" in packageJson
  ) {
    errors.push("Remove the package workspaces declaration.");
  }
  return errors;
}

function findSingletonFileErrors(
  root: string,
  config: ArchitectureConfig,
  generatedDirectories: Readonly<Set<string>>,
): string[] {
  return config.singletonFiles.flatMap((rule) => {
    const files = findProjectFiles(
      root,
      generatedDirectories,
      (fileName) =>
        fileName.startsWith(rule.prefix) &&
        rule.extensions.some((extension) => fileName.endsWith(extension)),
    );
    return files.length === 1 && files[0] === join(root, rule.expectedPath)
      ? []
      : [`Keep one ${rule.name} at the repository root.`];
  });
}

function findCssErrors(
  root: string,
  config: ArchitectureConfig,
  generatedDirectories: Readonly<Set<string>>,
): string[] {
  const cssFiles = findProjectFiles(root, generatedDirectories, (fileName) =>
    fileName.endsWith(".css"),
  );
  const misplaced = cssFiles.filter((path) => {
    const relativePath = relative(join(root, config.cssDirectory), path);
    return relativePath === ".." || relativePath.startsWith(`..${sep}`);
  });
  return misplaced.length === 0
    ? []
    : [`Keep CSS files inside the root ${config.cssDirectory}/ directory.`];
}

export function checkArchitectureShape(
  root: string,
  config: ArchitectureConfig,
): string[] {
  const generatedDirectories = new Set(config.generatedDirectories);
  const unapprovedRoot = findUnapprovedRootDirectories(
    root,
    config,
    generatedDirectories,
  );
  const unapprovedFeature = findUnapprovedFeatureDirectories(root, config);
  const invalidUi = findInvalidFeatureUiFiles(
    root,
    config,
    generatedDirectories,
  );

  return [
    ...(unapprovedRoot.length > 0
      ? [`Remove unapproved root directories: ${unapprovedRoot.join(", ")}.`]
      : []),
    ...(unapprovedFeature.length > 0
      ? [
          `Remove unapproved feature directories: ${unapprovedFeature.join(", ")}.`,
        ]
      : []),
    ...(invalidUi.length > 0
      ? [
          `Keep feature UI source files as ${config.featureUi.extensions.join(" or ")}: ${invalidUi.join(", ")}.`,
        ]
      : []),
    ...findPackageErrors(root, config, generatedDirectories),
    ...findSingletonFileErrors(root, config, generatedDirectories),
    ...findCssErrors(root, config, generatedDirectories),
  ];
}
