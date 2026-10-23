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
const requireFetchErrorHandling =
  typedFetchPlugin.rules["require-fetch-error-handling"];
const fetchMessage = /Import `fetch` from `void\/client`/u;
const handlingMessage = /Await `fetch` in try\/catch/u;

tester.run("require-typed-fetch", requireTypedFetch, {
  valid: [
    'import { fetch } from "void/client"; fetch("/api/users");',
    'import { fetch, FetchError } from "void/client"; fetch("/api/users");',
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
      code: 'import { fetch } from "void/client"; try {} catch ({ fetch }) {}',
      errors: [{ message: fetchMessage }],
    },
    {
      code: 'import { fetch } from "void/client"; const { api: fetch } = client;',
      errors: [{ message: fetchMessage }],
    },
  ],
});

tester.run("require-fetch-error-handling", requireFetchErrorHandling, {
  valid: [
    `import { fetch, FetchError } from "void/client";
     async function loadUsers() {
       try { await fetch("/api/users"); }
       catch (error) { if (error instanceof FetchError) throw error; }
     }`,
    `import { fetch, FetchError } from "void/client";
     async function loadUsers() {
       try { await fetch("/api/users"); }
       catch (error) { if (!(error instanceof FetchError)) throw error; }
     }`,
  ],
  invalid: [
    {
      code: 'import { fetch, FetchError } from "void/client"; fetch("/api/users");',
      errors: [{ message: handlingMessage }],
    },
    {
      code: `import { fetch, FetchError } from "void/client";
        async function loadUsers() {
          try { fetch("/api/users"); }
          catch (error) { if (error instanceof FetchError) throw error; }
        }`,
      errors: [{ message: handlingMessage }],
    },
    {
      code: `import { fetch } from "void/client";
        async function loadUsers() {
          try { await fetch("/api/users"); }
          catch (error) { if (error instanceof Error) throw error; }
        }`,
      errors: [{ message: handlingMessage }],
    },
    {
      code: `import { fetch, FetchError } from "void/client";
        async function loadUsers() {
          try { await fetch("/api/users"); }
          catch (error) { if (error instanceof Error) throw error; }
        }`,
      errors: [{ message: handlingMessage }],
    },
    {
      code: `import { fetch, FetchError } from "void/client";
        async function loadUsers() {
          try { await fetch("/api/users"); }
          catch (problem) { if (error instanceof FetchError) throw error; }
        }`,
      errors: [{ message: handlingMessage }],
    },
    {
      code: `import { fetch, FetchError } from "void/client";
        async function loadUsers() {
          try { await fetch("/api/users"); }
          catch (error) {
            const rethrow = () => { if (error instanceof FetchError) throw error; };
          }
        }`,
      errors: [{ message: handlingMessage }],
    },
  ],
});

it("tests every registered typed-fetch rule", () => {
  expect(Object.keys(typedFetchPlugin.rules)).toEqual([
    "require-typed-fetch",
    "require-fetch-error-handling",
  ]);
});
