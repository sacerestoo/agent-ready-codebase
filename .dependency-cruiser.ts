import {
  applicationDirectories,
  architecture,
  architectureDirectories,
} from "./tooling/architecture/paths.ts";

function escapePattern(path: string): string {
  return path.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const featurePath = escapePattern(architectureDirectories.features);
const sharedPath = escapePattern(architectureDirectories.shared);
const databaseModulePath = `^(?:${architecture.databaseModulePathPatterns.join("|")})`;
const databaseImporterPath = `^(?:${architecture.databaseImporterPathPatterns.join("|")})`;
const sharedForbiddenPath = `^(?:${applicationDirectories
  .filter((directory) => directory !== architectureDirectories.shared)
  .map((directory) => escapePattern(directory))
  .join("|")})/`;

export default {
  forbidden: [
    {
      name: "database-modules-only-from-configured-boundary",
      comment:
        "Database modules may only be imported by configured database entrypoints.",
      severity: "error",
      from: { pathNot: databaseImporterPath },
      to: { path: databaseModulePath },
    },
    {
      name: "features-not-to-features",
      comment: "Features must not depend on other features.",
      severity: "error",
      from: { path: `^${featurePath}/([^/]+)/` },
      to: {
        path: `^${featurePath}/`,
        pathNot: `^${featurePath}/$1/`,
      },
    },
    {
      name: "shared-not-to-app-code",
      comment: "Shared code must not depend on app entrypoints or features.",
      severity: "error",
      from: { path: `^${sharedPath}/` },
      to: { path: sharedForbiddenPath },
    },
    {
      name: "no-orphans-in-web-code",
      comment: "Feature and shared source files should be used by the app.",
      severity: "error",
      from: {
        orphan: true,
        path: `^(?:${featurePath}|${sharedPath})/`,
        pathNot: "/(tests?|__tests__)/|\\.(test|spec)\\.",
      },
      to: {},
    },
  ],
  options: {
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    tsPreCompilationDeps: true,
  },
};
