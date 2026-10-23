import { definePlugin, defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getChildren,
  getName,
  isAstNode,
  type AstNode,
  visit,
} from "./naming/ast-utils.ts";

type RuleContext = Parameters<
  NonNullable<Parameters<typeof defineRule>[0]["create"]>
>[0];

const noSuccessFlagEffect = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Do not use Void form success state as an effect trigger",
    },
    messages: {
      success:
        "Do not trigger submission work from `wasSuccessful`; use the mutation success callback so every submission is handled.",
    },
  },
  create(context: Readonly<RuleContext>) {
    return {
      CallExpression(input: unknown): void {
        if (!isAstNode(input)) return;
        const callee = getChild(input, "callee");
        const callback = getChildren(input, "arguments")[0];
        if (getName(callee) !== "useEffect" || callback === undefined) return;

        let readsSuccessFlag = false;
        visit(callback, (node: Readonly<AstNode>): void => {
          if (node.type === "Identifier" && getName(node) === "wasSuccessful") {
            readsSuccessFlag = true;
          }
        });
        if (readsSuccessFlag) {
          context.report({ node: input, messageId: "success" });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "void-forms" },
  rules: { "no-success-flag-effect": noSuccessFlagEffect },
});
