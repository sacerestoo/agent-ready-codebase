import { defineRule } from "vite-plus/lint/plugins";
import { isAstNode } from "../ast-utils.ts";

const noEnum = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow TypeScript enums" },
    messages: {
      enum: "Use an `as const` object or a union type instead of enum.",
    },
  },
  create(context) {
    return {
      TSEnumDeclaration(input: unknown): void {
        if (!isAstNode(input)) return;
        const node = input;
        context.report({ node, messageId: "enum" });
      },
    };
  },
});

export default noEnum;
