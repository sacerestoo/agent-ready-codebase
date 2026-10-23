import { RuleTester } from "vite-plus/lint/plugins-dev";
import { describe, expect, it } from "vite-plus/test";
import reactNamingPlugin from "../../react-naming.ts";
import callbackPropName from "../rules/callback-prop-name.ts";
import componentDefaultExport from "../rules/component-default-export.ts";
import componentHandlerName from "../rules/component-handler-name.ts";

RuleTester.describe = (name, callback): void => {
  void describe(name, callback);
};
RuleTester.it = (name, callback): void => {
  it(name, callback);
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

it("registers the React naming rules covered below", () => {
  expect(Object.keys(reactNamingPlugin.rules)).toEqual([
    "component-default-export",
    "custom-hook-name",
    "callback-prop-name",
    "component-handler-name",
    "non-jsx-function-export-const",
  ]);
});

tester.run("component-default-export", componentDefaultExport, {
  valid: [
    {
      code: "export default function OnboardingPage() { return <main />; }",
      filename: "page.tsx",
    },
    "function getValue() { return 1; }",
  ],
  invalid: [
    {
      code: "export function OnboardingPage() { return <main />; }",
      filename: "page.tsx",
      errors: [{ messageId: "defaultFunction" }],
    },
    {
      code: "function OnboardingPage() { return <main />; }",
      filename: "page.tsx",
      errors: [{ messageId: "defaultFunction" }],
    },
    {
      code: "export default function page() { return <main />; }",
      filename: "page.tsx",
      errors: [{ messageId: "defaultFunction" }, { messageId: "pascalCase" }],
    },
    {
      code: "const OnboardingPage = () => <main />;",
      filename: "page.tsx",
      errors: [{ messageId: "defaultFunction" }],
    },
  ],
});

tester.run("callback-prop-name", callbackPropName, {
  valid: [
    "type Props = { onSave: () => void };",
    "type Callback = () => void; type Props = { onSave: Callback };",
    "type Callback = () => void; type Props = { onSave: Callback | undefined };",
    "type Props = { title: string; onSave(): void };",
  ],
  invalid: [
    {
      code: "type Props = { save: () => void };",
      errors: [{ messageId: "callbackProp" }],
    },
    {
      code: "type Callback = () => void; type Props = { save: Callback };",
      errors: [{ messageId: "callbackProp" }],
    },
    {
      code: "type Props = { save(): void };",
      errors: [{ messageId: "callbackProp" }],
    },
  ],
});

tester.run("component-handler-name", componentHandlerName, {
  valid: [
    { code: "<button onClick={handleSave} />;", filename: "button.tsx" },
    { code: "<button onClick={props.onClick} />;", filename: "button.tsx" },
    {
      code: "<button onClick={handleSave as () => void} />;",
      filename: "button.tsx",
    },
    { code: "<button title={save()} />;", filename: "button.tsx" },
  ],
  invalid: [
    {
      code: "<button onClick={() => save()} />;",
      filename: "button.tsx",
      errors: [{ messageId: "handler" }],
    },
    {
      code: "<button onClick={save} />;",
      filename: "button.tsx",
      errors: [{ messageId: "handler" }],
    },
    {
      code: "<button onClick={props.save} />;",
      filename: "button.tsx",
      errors: [{ messageId: "handler" }],
    },
  ],
});
