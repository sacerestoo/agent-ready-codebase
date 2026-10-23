import { expect, it } from "vite-plus/test";
import namingPlugin from "../plugin.ts";

it("all registered naming rules have matching RuleTester suites", () => {
  const rules = namingPlugin.rules;
  if (typeof rules !== "object" || rules === null) {
    throw new TypeError("Naming plugin did not expose its rules.");
  }
  expect(Object.keys(rules)).toEqual([
    "no-javascript-files",
    "no-enum",
    "no-else",
    "component-default-export",
    "custom-hook-name",
    "camel-case-identifiers",
    "callback-prop-name",
    "component-handler-name",
    "non-jsx-function-export-const",
    "pascal-case-types",
  ]);
});
