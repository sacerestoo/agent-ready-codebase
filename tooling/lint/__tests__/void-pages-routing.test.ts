import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it } from "vite-plus/test";
import voidPagesRouting from "../void-pages-routing.ts";

RuleTester.describe = (name, callback): void => {
  void describe(name, callback);
};
RuleTester.it = (name, callback): void => {
  it(name, callback);
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});
const pageFile = "pages/users/index.server.ts";

tester.run(
  "page-server-exports",
  voidPagesRouting.rules["page-server-exports"],
  {
    valid: [
      {
        filename: pageFile,
        code: `import { defineHandler, type InferProps } from "void";
          export type Props = InferProps<typeof loader>;
          export const loader = defineHandler(() => ({ users: [] }));`,
      },
      {
        filename: pageFile,
        code: `import { defineHandler } from "void";
          export const actions = {
            update: defineHandler.withValidator({ body: schema })(async () => {}),
            delete: defineHandler(async () => {}),
          };`,
      },
    ],
    invalid: [
      {
        filename: pageFile,
        code: "export const loader = async () => ({ users: [] });",
        errors: [{ messageId: "handler" }, { messageId: "props" }],
      },
      {
        filename: pageFile,
        code: `import { defineHandler, type InferProps } from "void";
          export type Props = InferProps<typeof loader>;
          export const loader = async () => ({ users: [] });`,
        errors: [{ messageId: "handler" }],
      },
      {
        filename: pageFile,
        code: `import { defineHandler } from "void";
          export const action = defineHandler(async () => {});
          export const actions = { delete: defineHandler(async () => {}) };`,
        errors: [{ messageId: "action" }],
      },
    ],
  },
);

tester.run("static-page-layout", voidPagesRouting.rules["static-page-layout"], {
  valid: [
    {
      filename: "pages/users/index.tsx",
      code: 'export const layout = "account";',
    },
    { filename: "pages/index.tsx", code: "export const layout = false;" },
    {
      filename: "features/users/index.tsx",
      code: "export const layout = getLayout();",
    },
  ],
  invalid: [
    {
      filename: "pages/users/index.tsx",
      code: "export const layout = getLayout();",
      errors: [{ messageId: "layout" }],
    },
  ],
});

it("registers the Void page routing rules", () => {
  expect(Object.keys(voidPagesRouting.rules)).toEqual([
    "page-server-exports",
    "static-page-layout",
  ]);
});
