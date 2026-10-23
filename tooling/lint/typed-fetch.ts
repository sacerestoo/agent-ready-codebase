import { definePlugin, defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getChildren,
  getName,
  getString,
  isAstNode,
  type AstNode,
  visit,
} from "./naming/ast-utils.ts";

type RuleContext = Parameters<
  NonNullable<Parameters<typeof defineRule>[0]["create"]>
>[0];

const message = "Import `fetch` from `void/client` and use its typed routes.";
const globalFetchObjects = new Set(["global", "globalThis", "self", "window"]);

function report(context: Readonly<RuleContext>, node: Readonly<AstNode>): void {
  context.report({ node, message });
}

function hasTypedFetchImport(
  program: Readonly<AstNode>,
  context?: Readonly<RuleContext>,
): boolean {
  let hasTypedFetch = false;
  for (const declaration of getChildren(program, "body")) {
    if (declaration.type !== "ImportDeclaration") continue;
    const source = getString(getChild(declaration, "source"), "value");
    for (const specifier of getChildren(declaration, "specifiers")) {
      if (specifier.type !== "ImportSpecifier") continue;
      const imported = getName(getChild(specifier, "imported"));
      const local = getName(getChild(specifier, "local"));
      if (imported !== "fetch" && local !== "fetch") continue;
      if (
        source === "void/client" &&
        imported === "fetch" &&
        local === "fetch"
      ) {
        hasTypedFetch = true;
        continue;
      }
      if (context) report(context, specifier);
    }
  }
  return hasTypedFetch;
}

function patternBindsName(pattern: unknown, name: string): boolean {
  if (!isAstNode(pattern)) return false;
  if (pattern.type === "Identifier") return getString(pattern, "name") === name;
  if (pattern.type === "RestElement") {
    return patternBindsName(getChild(pattern, "argument"), name);
  }
  if (pattern.type === "AssignmentPattern") {
    return patternBindsName(getChild(pattern, "left"), name);
  }
  if (pattern.type === "ArrayPattern") {
    return getChildren(pattern, "elements").some((element) =>
      patternBindsName(element, name),
    );
  }
  if (pattern.type === "ObjectPattern") {
    return getChildren(pattern, "properties").some((property) =>
      property.type === "RestElement"
        ? patternBindsName(getChild(property, "argument"), name)
        : patternBindsName(getChild(property, "value"), name),
    );
  }
  return false;
}

function reportLocalFetchBindings(
  program: Readonly<AstNode>,
  context: Readonly<RuleContext>,
): void {
  visit(program, (node) => {
    if (node.type === "VariableDeclarator") {
      const id = getChild(node, "id");
      if (patternBindsName(id, "fetch")) {
        report(context, id ?? node);
      }
      return;
    }
    if (
      node.type !== "FunctionDeclaration" &&
      node.type !== "FunctionExpression" &&
      node.type !== "ArrowFunctionExpression" &&
      node.type !== "ClassDeclaration" &&
      node.type !== "ClassExpression" &&
      node.type !== "CatchClause"
    ) {
      return;
    }
    const id = getChild(node, "id");
    if (patternBindsName(id, "fetch")) {
      report(context, id ?? node);
    }
    const parameters =
      node.type === "CatchClause"
        ? [getChild(node, "param")].filter(
            (parameter) => parameter !== undefined,
          )
        : getChildren(node, "params");
    for (const parameter of parameters) {
      if (patternBindsName(parameter, "fetch")) {
        report(context, parameter);
      }
    }
  });
}

const requireTypedFetch = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require the typed fetch client from void/client",
    },
  },
  create(context) {
    let hasTypedFetch = false;
    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        hasTypedFetch = hasTypedFetchImport(input, context);
        reportLocalFetchBindings(input, context);
      },
      CallExpression(input: unknown): void {
        if (!isAstNode(input)) return;
        const callee = getChild(input, "callee");
        if (
          callee?.type === "Identifier" &&
          getString(callee, "name") === "fetch" &&
          !hasTypedFetch
        ) {
          report(context, callee);
        }
      },
      MemberExpression(input: unknown): void {
        if (!isAstNode(input)) return;
        const object = getChild(input, "object");
        const property = getChild(input, "property");
        if (
          object?.type === "Identifier" &&
          globalFetchObjects.has(getString(object, "name") ?? "") &&
          getName(property) === "fetch"
        ) {
          report(context, input);
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "typed-fetch" },
  rules: { "require-typed-fetch": requireTypedFetch },
});
