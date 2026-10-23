import { definePlugin, defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getChildren,
  getName,
  getString,
  isAstNode,
  visit,
  type AstNode,
} from "./naming/ast-utils.ts";

type RuleContext = Parameters<
  NonNullable<Parameters<typeof defineRule>[0]["create"]>
>[0];

const queryKeyMethods = new Set([
  "getQueryData",
  "getQueryState",
  "setQueryData",
  "getQueryDefaults",
  "setQueryDefaults",
]);

function getImportedNames(program: Readonly<AstNode>): Set<string> {
  const names = new Set<string>();
  visit(program, (node) => {
    if (node.type !== "ImportDeclaration") return;
    for (const specifier of getChildren(node, "specifiers")) {
      const name = getName(getChild(specifier, "local"));
      if (name !== undefined && name !== "") names.add(name);
    }
  });
  return names;
}

function isImportedReference(
  expression: unknown,
  importedNames: Readonly<Set<string>>,
): boolean {
  if (!isAstNode(expression)) return false;
  if (expression.type === "Identifier") {
    return importedNames.has(getString(expression, "name") ?? "");
  }

  if (expression.type === "MemberExpression") {
    return isImportedReference(getChild(expression, "object"), importedNames);
  }
  if (expression.type === "CallExpression") {
    return isImportedReference(getChild(expression, "callee"), importedNames);
  }
  if (
    expression.type === "TSAsExpression" ||
    expression.type === "TSTypeAssertion" ||
    expression.type === "TSNonNullExpression" ||
    expression.type === "ChainExpression" ||
    expression.type === "TSInstantiationExpression"
  ) {
    return isImportedReference(
      getChild(expression, "expression"),
      importedNames,
    );
  }

  return false;
}

function reportHardcodedKey(
  context: Readonly<RuleContext>,
  node: Readonly<AstNode>,
): void {
  context.report({
    node,
    message:
      "Use an imported query key factory instead of hardcoding a query key.",
  });
}

const noHardcodedQueryKeys = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require imported query key factories",
    },
  },
  create(context) {
    let importedNames = new Set<string>();
    return {
      Program(input: unknown): void {
        if (isAstNode(input)) importedNames = getImportedNames(input);
      },
      Property(input: unknown): void {
        if (!isAstNode(input)) return;
        const key = getChild(input, "key");
        if (getName(key) !== "queryKey") return;
        const value = getChild(input, "value");
        if (!value || !isImportedReference(value, importedNames)) {
          reportHardcodedKey(context, value ?? input);
        }
      },
      CallExpression(input: unknown): void {
        if (!isAstNode(input)) return;
        const callee = getChild(input, "callee");
        if (callee?.type !== "MemberExpression") return;
        if (!queryKeyMethods.has(getName(getChild(callee, "property")) ?? "")) {
          return;
        }
        const queryKey = getChildren(input, "arguments")[0];
        if (
          queryKey !== undefined &&
          !isImportedReference(queryKey, importedNames)
        ) {
          reportHardcodedKey(context, queryKey);
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "query" },
  rules: { "no-hardcoded-query-keys": noHardcodedQueryKeys },
});
