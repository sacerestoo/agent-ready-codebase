import { expect, it } from "vite-plus/test";
import { commonRuleOverrides } from "../common.ts";
import { createLintConfig, type LintProfileSelection } from "../profiles.ts";

const enabledProfiles = {
  react: true,
  vitePlus: true,
  voidProject: true,
  tanstackQuery: true,
} satisfies LintProfileSelection;

const disabledProfiles = {
  react: false,
  vitePlus: false,
  voidProject: false,
  tanstackQuery: false,
} satisfies LintProfileSelection;

it("keeps common checks on when every optional profile is off", () => {
  const config = createLintConfig(disabledProfiles);

  expect(config.rules).toMatchObject({
    "codebase/no-javascript-files": "error",
    "testing/require-test-filename": "error",
  });
  expect(config.rules).not.toHaveProperty("vite-plus/prefer-vite-plus-imports");
  expect(config.jsPlugins).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "codebase" }),
      expect.objectContaining({ name: "testing" }),
    ]),
  );
});

it("disables React rules without changing the other profiles", () => {
  const config = createLintConfig({
    ...enabledProfiles,
    react: false,
  });

  expect(config.jsPlugins).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "react-codebase" }),
    ]),
  );
  expect(config.overrides).toHaveLength(commonRuleOverrides.length);
  expect(config.rules).toHaveProperty(
    "typed-fetch/require-typed-fetch",
    "error",
  );
  expect(config.rules).toHaveProperty(
    "testing/require-vite-plus-test",
    "error",
  );
  expect(config.rules).toHaveProperty(
    "void-pages-routing/page-server-exports",
    "error",
  );
  expect(config.rules).toHaveProperty(
    "void-pages-routing/static-page-layout",
    "error",
  );
  expect(config.rules).toHaveProperty(
    "void-forms/no-success-flag-effect",
    "error",
  );
  expect(config.rules).toHaveProperty(
    "query/canonical-query-definitions",
    "error",
  );
  expect(config.rules).toHaveProperty("query/no-hardcoded-query-keys", "error");
});

it("disables Vite+ lint rules while keeping Void and TanStack rules", () => {
  const config = createLintConfig({
    ...enabledProfiles,
    vitePlus: false,
  });

  expect(config.jsPlugins).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ name: "vite-plus" })]),
  );
  expect(config.rules).not.toHaveProperty("vite-plus/prefer-vite-plus-imports");
  expect(config.rules).not.toHaveProperty("testing/require-vite-plus-test");
  expect(config.rules).toHaveProperty(
    "typed-fetch/require-typed-fetch",
    "error",
  );
  expect(config.rules).toHaveProperty("query/no-hardcoded-query-keys", "error");
});

it("lets Void and TanStack Query be disabled independently", () => {
  const config = createLintConfig({
    ...enabledProfiles,
    voidProject: false,
    tanstackQuery: false,
  });

  expect(config.rules).not.toHaveProperty("typed-fetch/require-typed-fetch");
  expect(config.rules).not.toHaveProperty(
    "void-pages-routing/page-server-exports",
  );
  expect(config.rules).not.toHaveProperty(
    "void-pages-routing/static-page-layout",
  );
  expect(config.rules).not.toHaveProperty("void-forms/no-success-flag-effect");
  expect(config.rules).not.toHaveProperty("query/canonical-query-definitions");
  expect(config.rules).not.toHaveProperty("query/no-hardcoded-query-keys");
  expect(config.rules).toHaveProperty(
    "vite-plus/prefer-vite-plus-imports",
    "error",
  );
});
