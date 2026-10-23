import { defineRule } from "vite-plus/lint/plugins";
import {
  containsJsx,
  getChild,
  getChildren,
  getString,
  isAstNode,
  visit,
} from "../ast-utils.ts";
import { componentNamePattern } from "../patterns.ts";

const componentDefaultExport = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Require default function exports for components" },
    messages: {
      defaultFunction:
        "Export each component as a named `export default function`.",
      pascalCase: "Component function names must use PascalCase.",
    },
  },
  create(context) {
    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        const program = input;
        const defaultFunctions = new WeakSet();
        for (const statement of getChildren(program, "body")) {
          const declaration = getChild(statement, "declaration");
          if (
            statement.type === "ExportDefaultDeclaration" &&
            declaration?.type === "FunctionDeclaration"
          ) {
            defaultFunctions.add(declaration);
          }
        }

        let hasComponentFunction = false;
        visit(program, (node) => {
          const body = getChild(node, "body");
          const id = getChild(node, "id");
          if (node.type !== "FunctionDeclaration" || !containsJsx(body)) {
            return;
          }

          hasComponentFunction = true;
          if (
            defaultFunctions.has(node) &&
            id &&
            componentNamePattern.test(getString(id, "name") ?? "")
          ) {
            return;
          }

          context.report({ node, messageId: "defaultFunction" });
          if (id && !componentNamePattern.test(getString(id, "name") ?? "")) {
            context.report({ node: id, messageId: "pascalCase" });
          }
        });

        if (containsJsx(program) && !hasComponentFunction) {
          context.report({ node: program, messageId: "defaultFunction" });
        }
      },
    };
  },
});

export default componentDefaultExport;
