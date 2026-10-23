import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applicationDirectories,
  architectureDirectories,
  dependencyCruiserConfig,
  featureSubdirectories,
  generatedDirectories,
  rootDirectories,
  rootPackageManifest,
  rootTypeScriptConfig,
  rootVoidConfig,
  voidConfigExtensions,
  voidConfigPrefix,
} from "./architecture/paths.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const generatedDirectorySet = new Set<string>(generatedDirectories);

function findProjectFiles(
  directory: string,
  matcher: Readonly<{ test: (fileName: string) => boolean }>,
): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return generatedDirectorySet.has(entry.name)
        ? []
        : findProjectFiles(path, matcher);
    }

    return matcher.test(entry.name) ? [path] : [];
  });
}

const packageJson: unknown = JSON.parse(
  readFileSync(join(root, rootPackageManifest), "utf8"),
);
const packageFiles = findProjectFiles(root, {
  test: (fileName) => fileName === rootPackageManifest,
});
const voidConfigs = findProjectFiles(root, {
  test: (fileName) =>
    fileName.startsWith(voidConfigPrefix) &&
    voidConfigExtensions.some((extension) => fileName.endsWith(extension)),
});
const cssFiles = findProjectFiles(root, {
  test: (fileName) => fileName.endsWith(".css"),
});
const architectureErrors: string[] = [];
const allowedRootDirectories = new Set<string>(rootDirectories);
const addedRootDirectories = readdirSync(root, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      !generatedDirectorySet.has(entry.name) &&
      !allowedRootDirectories.has(entry.name),
  )
  .map((entry) => entry.name);

if (addedRootDirectories.length > 0) {
  architectureErrors.push(
    `Remove unapproved root directories: ${addedRootDirectories.join(", ")}.`,
  );
}
const featuresRoot = join(root, architectureDirectories.features);
const allowedFeatureSubdirectories = new Set<string>(featureSubdirectories);
const addedFeatureSubdirectories = existsSync(featuresRoot)
  ? readdirSync(featuresRoot, { withFileTypes: true })
      .filter((feature) => feature.isDirectory())
      .flatMap((feature) =>
        readdirSync(join(featuresRoot, feature.name), { withFileTypes: true })
          .filter(
            (entry) =>
              entry.isDirectory() &&
              !allowedFeatureSubdirectories.has(entry.name),
          )
          .map((entry) => `${feature.name}/${entry.name}`),
      )
  : [];

if (addedFeatureSubdirectories.length > 0) {
  architectureErrors.push(
    `Remove unapproved feature directories: ${addedFeatureSubdirectories.join(", ")}.`,
  );
}

if (
  typeof packageJson === "object" &&
  packageJson !== null &&
  "workspaces" in packageJson
) {
  architectureErrors.push("Remove the package workspaces declaration.");
}
if (packageFiles.some((path) => path !== join(root, rootPackageManifest))) {
  architectureErrors.push("Keep package.json at the repository root only.");
}
if (voidConfigs.length !== 1 || voidConfigs[0] !== join(root, rootVoidConfig)) {
  architectureErrors.push("Keep one Void config at the repository root.");
}
if (
  cssFiles.some((path) => {
    const pathFromStyles = relative(join(root, "styles"), path);
    return pathFromStyles === ".." || pathFromStyles.startsWith(`..${sep}`);
  })
) {
  architectureErrors.push("Keep CSS files inside the root styles/ directory.");
}

if (architectureErrors.length > 0) {
  for (const error of architectureErrors) console.error(error);
  process.exit(1);
}

const result = spawnSync(
  "bunx",
  [
    "depcruise",
    "--validate",
    dependencyCruiserConfig,
    "--ts-config",
    join(root, rootTypeScriptConfig),
    ...applicationDirectories.filter((directory) =>
      existsSync(join(root, directory)),
    ),
  ],
  { cwd: root, stdio: "inherit" },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
