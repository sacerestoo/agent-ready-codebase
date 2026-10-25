import { readFile } from "node:fs/promises";

type EnvEntry = { value: string };

function readSchemaNames(source: string): {
  all: Set<string>;
  required: Set<string>;
} {
  const schemas = [...source.matchAll(/defineEnv\s*\(\s*\{([^}]*)\}\s*\)/gu)];
  if (schemas.length !== 1)
    throw new Error("env.ts must contain one defineEnv object.");
  const body = schemas[0]?.[1];
  if (body === undefined)
    throw new Error("env.ts has an invalid defineEnv object.");
  const properties = [...body.matchAll(/(?:^|,)\s*([A-Z_][A-Z0-9_]*)\s*:/gmu)];
  const names = new Set(
    properties
      .map((property) => property[1])
      .filter((name): name is string => name !== undefined),
  );
  if (names.size !== properties.length || names.size === 0) {
    throw new Error("env.ts has an unsupported or duplicate environment key.");
  }
  const optionalNames = new Set(
    [...body.matchAll(/([A-Z_][A-Z0-9_]*)\s*:[^,\n]*\.optional\(\)/gu)]
      .map((property) => property[1])
      .filter((name): name is string => name !== undefined),
  );
  return {
    all: names,
    required: new Set([...names].filter((name) => !optionalNames.has(name))),
  };
}

function parseValue(rawValue: string): { valid: boolean; value: string } {
  const trimmed = rawValue.trim();
  const quote = trimmed[0];
  if (quote === "'" || quote === '"') {
    const closingQuote = trimmed.indexOf(quote, 1);
    if (closingQuote < 0) return { valid: false, value: "" };
    const trailing = trimmed.slice(closingQuote + 1).trim();
    return {
      valid: trailing === "" || trailing.startsWith("#"),
      value: trimmed.slice(1, closingQuote),
    };
  }
  return { valid: true, value: (trimmed.split("#", 1)[0] ?? "").trim() };
}

function readDotenvEntries(source: string): Map<string, EnvEntry> {
  const entries = new Map<string, EnvEntry>();
  for (const [index, line] of source.split(/\r?\n/u).entries()) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u.exec(
      trimmed,
    );
    if (!match)
      throw new Error(`.env has an invalid entry on line ${index + 1}.`);
    const name = match[1];
    const rawValue = match[2];
    if (name === undefined || rawValue === undefined || entries.has(name)) {
      throw new Error(
        `.env has a duplicate or invalid key on line ${index + 1}.`,
      );
    }
    const parsed = parseValue(rawValue);
    if (!parsed.valid)
      throw new Error(`.env has an invalid value on line ${index + 1}.`);
    entries.set(name, { value: parsed.value });
  }
  return entries;
}

const [schemaSource, dotenvSource] = await Promise.all([
  readFile(new URL("../env.ts", import.meta.url), "utf8"),
  readFile(new URL("../.env", import.meta.url), "utf8"),
]);
const schemaNames = readSchemaNames(schemaSource);
const dotenvEntries = readDotenvEntries(dotenvSource);
const dotenvNames = new Set(dotenvEntries.keys());
const missingValues = [...schemaNames.required].filter(
  (name) => !dotenvNames.has(name),
);
const extraValues = [...dotenvNames].filter(
  (name) => !schemaNames.all.has(name),
);
const emptyValues = [...dotenvEntries]
  .filter(([, entry]) => entry.value.trim() === "")
  .map(([name]) => name);

if (
  missingValues.length > 0 ||
  extraValues.length > 0 ||
  emptyValues.length > 0
) {
  if (missingValues.length > 0) {
    console.error(`Missing from .env: ${missingValues.join(", ")}`);
  }
  if (extraValues.length > 0) {
    console.error(`Missing from env.ts: ${extraValues.join(", ")}`);
  }
  if (emptyValues.length > 0) {
    console.error(`Empty values in .env: ${emptyValues.join(", ")}`);
  }
  process.exitCode = 1;
}
