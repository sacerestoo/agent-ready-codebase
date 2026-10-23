import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it } from "vite-plus/test";
import typedFetchPlugin from "../typed-fetch.ts";

RuleTester.describe = (name, callback): void => {
  void describe(name, callback);
};
RuleTester.it = (name, callback): void => {
  it(name, callback);
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});
const requireTypedFetch = typedFetchPlugin.rules["require-typed-fetch"];
const fetchMessage = /Import `fetch` from `void\/client`/u;

tester.run("require-typed-fetch", requireTypedFetch, {
  valid: [
    'import { fetch } from "void/client"; fetch("/api/users");',
    'import { fetch } from "void/client"; async function load() { return fetch("/api/users"); }',
  ],
  invalid: [
    {
      code: 'fetch("/api/users");',
      errors: [{ message: fetchMessage }],
    },
    ...["global", "globalThis", "self", "window"].map((name) => ({
      code: `${name}.fetch("/api/users");`,
      errors: [{ message: fetchMessage }],
    })),
    {
      code: 'import { fetch } from "other";',
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch as typedFetch } from "void/client";',
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch } from "void/client"; function run() { const fetch = () => null; }',
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch } from "void/client"; function run(fetch: () => void) {}',
      errors: [{ message: fetchMessage }],
    },
    {
      code: "function fetch() {}",
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch } from "void/client"; try {} catch (fetch) {}',
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch } from "void/client"; const { fetch } = client;',
      errors: [{ message: fetchMessage }],
    },
  ],
});

it("registers only the typed-client rule", () => {
  expect(Object.keys(typedFetchPlugin.rules)).toEqual(["require-typed-fetch"]);
});
