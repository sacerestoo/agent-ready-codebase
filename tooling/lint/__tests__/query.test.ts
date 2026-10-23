import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it } from "vite-plus/test";
import queryPlugin from "../query.ts";

RuleTester.describe = (name, callback): void => {
  void describe(name, callback);
};
RuleTester.it = (name, callback): void => {
  it(name, callback);
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

tester.run(
  "no-hardcoded-query-keys",
  queryPlugin.rules["no-hardcoded-query-keys"],
  {
    valid: [
      'import { userKeys } from "./user-keys"; useQuery({ queryKey: userKeys.list() });',
      'import { userKeys as keys } from "./user-keys"; useQuery({ queryKey: keys.list() });',
      'import { userKeys } from "./user-keys"; client.getQueryData(userKeys.detail(id));',
      'import { userKeys } from "./user-keys"; client.getQueryState(userKeys.list());',
      'import { userKeys } from "./user-keys"; client.setQueryData(userKeys.list(), data);',
      'import { userKeys } from "./user-keys"; client.getQueryDefaults(userKeys.list());',
      'import { userKeys } from "./user-keys"; client.setQueryDefaults(userKeys.list(), options);',
      'import { userKeys } from "./user-keys"; useQuery({ queryKey: userKeys.list() as const });',
      'client.invalidateQueries(["users"]);',
    ],
    invalid: [
      {
        code: 'useQuery({ queryKey: ["users"] });',
        errors: [{ message: /imported query key factory/u }],
      },
      {
        code: 'const userKeys = { list: () => ["users"] }; useQuery({ queryKey: userKeys.list() });',
        errors: [{ message: /imported query key factory/u }],
      },
      {
        code: 'client.getQueryData(["users"]);',
        errors: [{ message: /imported query key factory/u }],
      },
      {
        code: 'client.setQueryData(["users"], data);',
        errors: [{ message: /imported query key factory/u }],
      },
    ],
  },
);

it("tests every registered query rule", () => {
  expect(Object.keys(queryPlugin.rules)).toEqual(["no-hardcoded-query-keys"]);
});
