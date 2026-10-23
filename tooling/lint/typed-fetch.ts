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
const fetchHandlingMessage =
  "Await `fetch` in try/catch and check the caught error with `instanceof FetchError`.";
const globalFetchObjects = new Set(["global", "globalThis", "self", "window"]);

function report(context: Readonly<RuleContext>, node: Readonly<AstNode>): void {
  context.report({ node, message });
}

function hasTypedFetchImport(
  program: Readonly<AstNode>,
  context?: Readonly<RuleContext>,
): { fetch: boolean; fetchError: boolean } {
  let hasTypedFetch = false;
  let hasFetchError = false;
  for (const declaration of getChildren(program, "body")) {
    if (declaration.type !== "ImportDeclaration") continue;
    const source = getString(getChild(declaration, "source"), "value");
    for (const specifier of getChildren(declaration, "specifiers")) {
      if (specifier.type !== "ImportSpecifier") continue;
      const imported = getName(getChild(specifier, "imported"));
      const local = getName(getChild(specifier, "local"));
      const name =
        imported === "fetch" || local === "fetch"
          ? "fetch"
          : imported === "FetchError" || local === "FetchError"
            ? "FetchError"
            : undefined;
      if (name === undefined) continue;
      if (source === "void/client" && imported === name && local === name) {
        if (name === "fetch") hasTypedFetch = true;
        else hasFetchError = true;
        continue;
      }
      if (context) report(context, specifier);
    }
  }
  return { fetch: hasTypedFetch, fetchError: hasFetchError };
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
      if (patternBindsName(id, "fetch") || patternBindsName(id, "FetchError")) {
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
    if (patternBindsName(id, "fetch") || patternBindsName(id, "FetchError")) {
      report(context, id ?? node);
    }
    const parameters =
      node.type === "CatchClause"
        ? [getChild(node, "param")].filter(
            (parameter) => parameter !== undefined,
          )
        : getChildren(node, "params");
    for (const parameter of parameters) {
      if (
        patternBindsName(parameter, "fetch") ||
        patternBindsName(parameter, "FetchError")
      ) {
        report(context, parameter);
      }
    }
  });
}

function getFetchCatch(
  node: Readonly<AstNode>,
): { handler: AstNode; awaited: boolean } | undefined {
  let child: Readonly<AstNode> = node;
  let parent = getChild(child, "parent");
  let awaited = false;
  while (parent) {
    if (parent.type === "AwaitExpression") awaited = true;
    if (
      parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression"
    ) {
      return undefined;
    }
    if (parent.type === "TryStatement" && getChild(parent, "block") === child) {
      const handler = getChild(parent, "handler");
      if (handler) return { handler, awaited };
    }
    child = parent;
    parent = getChild(parent, "parent");
  }
  return undefined;
}

function isFetchErrorCheck(node: unknown, errorName: string): boolean {
  if (!isAstNode(node)) return false;
  if (node.type === "UnaryExpression" && getString(node, "operator") === "!") {
    return isFetchErrorCheck(getChild(node, "argument"), errorName);
  }
  return (
    node.type === "BinaryExpression" &&
    getString(node, "operator") === "instanceof" &&
    getName(getChild(node, "left")) === errorName &&
    getName(getChild(node, "right")) === "FetchError"
  );
}

function hasFetchErrorCheck(handler: Readonly<AstNode>): boolean {
  const errorName = getName(getChild(handler, "param"));
  if (errorName === undefined || errorName === "") return false;
  let hasCheck = false;
  visit(getChild(handler, "body"), (node) => {
    if (
      node.type !== "IfStatement" ||
      !isFetchErrorCheck(getChild(node, "test"), errorName)
    ) {
      return;
    }
    let parent = getChild(node, "parent");
    while (
      parent &&
      parent !== handler &&
      parent.type !== "FunctionDeclaration" &&
      parent.type !== "FunctionExpression" &&
      parent.type !== "ArrowFunctionExpression"
    ) {
      parent = getChild(parent, "parent");
    }
    if (parent === handler) hasCheck = true;
  });
  return hasCheck;
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
        const imports = hasTypedFetchImport(input, context);
        hasTypedFetch = imports.fetch;
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

const requireFetchErrorHandling = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require FetchError checks around typed fetch calls",
    },
  },
  create(context) {
    let hasFetchError = false;
    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        hasFetchError = hasTypedFetchImport(input).fetchError;
      },
      CallExpression(input: unknown): void {
        if (!isAstNode(input)) return;
        const callee = getChild(input, "callee");
        if (
          callee?.type !== "Identifier" ||
          getString(callee, "name") !== "fetch"
        ) {
          return;
        }
        const fetchCatch = getFetchCatch(input);
        if (
          fetchCatch === undefined ||
          !fetchCatch.awaited ||
          !hasFetchError ||
          !hasFetchErrorCheck(fetchCatch.handler)
        ) {
          context.report({ node: input, message: fetchHandlingMessage });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "typed-fetch" },
  rules: {
    "require-typed-fetch": requireTypedFetch,
    "require-fetch-error-handling": requireFetchErrorHandling,
  },
});
