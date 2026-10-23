import {
  applicationDirectories,
  architectureDirectories,
} from "./tooling/architecture/paths.ts";

const featurePath = architectureDirectories.features;
const sharedPath = architectureDirectories.shared;
const sharedForbiddenPath = `^(?:${applicationDirectories
  .filter((directory) => directory !== sharedPath)
  .join("|")})/`;

export default {
  forbidden: [
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
      name: "feature-internals-not-public",
      comment: "Import features through their index.ts entrypoint.",
      severity: "error",
      from: { pathNot: `^${featurePath}/` },
      to: {
        path: `^${featurePath}/[^/]+/`,
        pathNot: `^${featurePath}/[^/]+/index\\.ts$`,
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
