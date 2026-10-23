import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkArchitectureShape } from "./architecture/check.ts";
import { architecture } from "./architecture/project.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const architectureErrors = checkArchitectureShape(root, architecture);

if (architectureErrors.length > 0) {
  for (const error of architectureErrors) console.error(error);
  process.exit(1);
}

const result = spawnSync(
  "bunx",
  [
    "depcruise",
    "--validate",
    architecture.dependencyCruiserConfig,
    "--ts-config",
    join(root, architecture.typeScriptConfig),
    ...architecture.applicationDirectoryKeys
      .map((key) => architecture.directories[key])
      .filter((directory) => existsSync(join(root, directory))),
  ],
  { cwd: root, stdio: "inherit" },
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
