import { defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getField,
  getName,
  getString,
  isAstNode,
} from "../ast-utils.ts";
import { callbackNamePattern } from "../patterns.ts";

const handlerNamePattern = /^handle[A-Z][A-Za-z0-9]*$/u;

const componentHandlerName = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Require named functions for JSX event handlers" },
    messages: {
      handler: "Use a handleX function, or pass through an onX callback prop.",
    },
  },
  create(context) {
    return {
      JSXAttribute(input: unknown): void {
        if (!isAstNode(input)) return;
        const node = input;
        const attributeName = getName(getChild(node, "name"));
        if (!/^on[A-Z]/u.test(attributeName ?? "")) return;

        let expression = getChild(getChild(node, "value"), "expression");
        while (
          expression?.type === "TSAsExpression" ||
          expression?.type === "TSNonNullExpression" ||
          expression?.type === "ParenthesizedExpression"
        ) {
          expression = getChild(expression, "expression");
        }

        let handlerName;
        if (expression?.type === "Identifier") {
          handlerName = getString(expression, "name");
        } else if (
          expression?.type === "MemberExpression" &&
          getField(expression, "computed") !== true
        ) {
          handlerName = getName(getChild(expression, "property"));
        }

        if (
          handlerName !== undefined &&
          handlerName !== "" &&
          (callbackNamePattern.test(handlerName) ||
            handlerNamePattern.test(handlerName))
        ) {
          return;
        }

        context.report({
          node: getChild(node, "value") ?? node,
          messageId: "handler",
        });
      },
    };
  },
});

export default componentHandlerName;
