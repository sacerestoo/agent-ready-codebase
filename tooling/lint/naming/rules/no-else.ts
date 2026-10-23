import { defineRule } from "vite-plus/lint/plugins";
import { getChild, isAstNode } from "../ast-utils.ts";

const noElse = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow else branches" },
    messages: { else: "Use an early return instead of an else branch." },
  },
  create(context) {
    return {
      IfStatement(input: unknown): void {
        if (!isAstNode(input)) return;
        const node = input;
        const alternate = getChild(node, "alternate");
        if (alternate) {
          context.report({ node: alternate, messageId: "else" });
        }
      },
    };
  },
});

export default noElse;
