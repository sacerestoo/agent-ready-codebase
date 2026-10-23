import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, it } from "vite-plus/test";
import customHookName from "../rules/custom-hook-name.ts";
import camelCaseIdentifiers, {
  pascalCaseTypes,
} from "../rules/identifier-case.ts";
import noElse from "../rules/no-else.ts";
import noEnum from "../rules/no-enum.ts";
import noJavascriptFiles from "../rules/no-javascript-files.ts";
import nonJsxFunctionExportConst from "../rules/non-jsx-function-export-const.ts";

RuleTester.describe = (name, callback): void => {
  void describe(name, callback);
};
RuleTester.it = (name, callback): void => {
  it(name, callback);
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

tester.run("no-javascript-files", noJavascriptFiles, {
  valid: [
    { code: "const title = 'Void';", filename: "page.ts" },
    { code: "const title = 'Void';", filename: "page.tsx" },
  ],
  invalid: ["page.js", "page.jsx", "page.mjs", "page.cjs"].map((filename) => ({
    code: "const title = 'Void';",
    filename,
    errors: [{ messageId: "typescriptOnly" }],
  })),
});

tester.run("no-enum", noEnum, {
  valid: [
    "const direction = { up: 'up' } as const;",
    "type Direction = 'up' | 'down';",
  ],
  invalid: [
    {
      code: "enum Direction { Up }",
      errors: [{ messageId: "enum" }],
    },
    {
      code: "const enum Direction { Up }",
      errors: [{ messageId: "enum" }],
    },
  ],
});

tester.run("no-else", noElse, {
  valid: [
    "function getValue(ready: boolean) { if (ready) return 1; return 0; }",
    "function getValue(ready: boolean) { if (ready) { return 1; } }",
  ],
  invalid: [
    {
      code: "function getValue(ready: boolean) { if (ready) return 1; else return 0; }",
      errors: [{ messageId: "else" }],
    },
    {
      code: "function getValue(ready: boolean) { if (ready) return 1; else if (ready) return 2; }",
      errors: [{ messageId: "else" }],
    },
  ],
});

tester.run("custom-hook-name", customHookName, {
  valid: [
    "function useUser() { useQuery(); }",
    "const useUser = () => useQuery();",
    "function getUser() { return user; }",
  ],
  invalid: [
    {
      code: "function getUser() { useQuery(); }",
      errors: [{ messageId: "hook" }],
    },
    {
      code: "const getUser = () => useQuery();",
      errors: [{ messageId: "hook" }],
    },
    {
      code: "const getUser = function () { useQuery(); };",
      errors: [{ messageId: "hook" }],
    },
  ],
});

tester.run("camel-case-identifiers", camelCaseIdentifiers, {
  valid: [
    "const userName = 'Ada';",
    "const { userName } = source;",
    "const [firstName, ...otherNames] = names;",
    "type userRecord = { displayName: string; onSave: () => void };",
    "interface userInfo { displayName: string; }",
    "export const GET = () => null;",
    {
      code: "export default function HomePage() { return <main />; }",
      filename: "page.tsx",
    },
  ],
  invalid: [
    {
      code: "const user_name = 'Ada';",
      errors: [{ message: /must use camelCase/u }],
    },
    {
      code: "function load_user(display_name: string) { return display_name; }",
      errors: [{ message: /load_user/u }, { message: /display_name/u }],
    },
    {
      code: "const { display_name: display_name } = source;",
      errors: [{ message: /display_name/u }, { message: /display_name/u }],
    },
  ],
});

tester.run("pascal-case-types", pascalCaseTypes, {
  valid: [
    "type UserRecord = { displayName: string };",
    "interface UserInfo { displayName: string; }",
    "type UserRecord<TValue> = { value: TValue };",
  ],
  invalid: [
    {
      code: "type userRecord = { displayName: string };",
      errors: [{ message: /userRecord.*must use PascalCase/u }],
    },
    {
      code: "interface userInfo { displayName: string; }",
      errors: [{ message: /userInfo.*must use PascalCase/u }],
    },
    {
      code: "type UserRecord<value> = { value: value };",
      errors: [{ message: /value.*must use PascalCase/u }],
    },
  ],
});

tester.run("non-jsx-function-export-const", nonJsxFunctionExportConst, {
  valid: [
    "export const getUser = () => user;",
    "export const getUser = function () { return user; };",
    "export default function HomePage() { return <main />; }",
    "export const HomePage = () => <main />;",
    "const value = 1;",
    "function getUser() { return user; }",
    "const getUser = () => user;",
    "const getUser = function () { return user; };",
  ],
  invalid: [
    {
      code: "export function getUser() { return user; }",
      errors: [{ messageId: "exportConst" }],
    },
    {
      code: "export default function getUser() { return user; }",
      errors: [{ messageId: "exportConst" }],
    },
    {
      code: "export let getUser = () => user;",
      errors: [{ messageId: "exportConst" }],
    },
  ],
});
