import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it } from "vite-plus/test";
import voidFormsPlugin from "../void-forms.ts";

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
  "no-success-flag-effect",
  voidFormsPlugin.rules["no-success-flag-effect"],
  {
    valid: [
      "useEffect(() => { refresh(); }, []);",
      "if (wasSuccessful) refresh();",
    ],
    invalid: [
      {
        code: "useEffect(() => { if (wasSuccessful) refresh(); }, [wasSuccessful]);",
        errors: [{ messageId: "success" }],
      },
    ],
  },
);

it("registers the Void form rule", () => {
  expect(Object.keys(voidFormsPlugin.rules)).toEqual([
    "no-success-flag-effect",
  ]);
});
