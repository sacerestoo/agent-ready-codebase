import { definePlugin, defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getChildren,
  getField,
  getName,
  getString,
  isAstNode,
  type AstNode,
} from "./naming/ast-utils.ts";

type RuleContext = Parameters<
  NonNullable<Parameters<typeof defineRule>[0]["create"]>
>[0];

function isPageServerFile(filename: string): boolean {
  return /(?:^|[/\\])pages(?:[/\\]).+\.server\.ts$/u.test(filename);
}

function isDefineHandlerCall(node: unknown): boolean {
  if (!isAstNode(node) || node.type !== "CallExpression") return false;
  let callee = getChild(node, "callee");
  while (callee?.type === "CallExpression") {
    callee = getChild(callee, "callee");
  }
  if (callee?.type === "Identifier") {
    return getName(callee) === "defineHandler";
  }
  return (
    callee?.type === "MemberExpression" &&
    getName(getChild(callee, "object")) === "defineHandler" &&
    getName(getChild(callee, "property")) === "withValidator"
  );
}

function importsVoidNames(
  program: Readonly<AstNode>,
  names: Readonly<Set<string>>,
): boolean {
  const importedNames = new Set(
    getChildren(program, "body").flatMap((declaration) => {
      if (declaration.type !== "ImportDeclaration") return [];
      if (getString(getChild(declaration, "source"), "value") !== "void") {
        return [];
      }
      return getChildren(declaration, "specifiers").flatMap((specifier) => {
        if (specifier.type !== "ImportSpecifier") return [];
        const imported = getName(getChild(specifier, "imported"));
        const local = getName(getChild(specifier, "local"));
        return imported === local && imported !== undefined ? [imported] : [];
      });
    }),
  );
  return [...names].every((name) => importedNames.has(name));
}

function exportedVariables(program: Readonly<AstNode>): Map<string, AstNode> {
  return new Map(
    getChildren(program, "body").flatMap((statement) => {
      if (statement.type !== "ExportNamedDeclaration") return [];
      const declaration = getChild(statement, "declaration");
      if (declaration?.type !== "VariableDeclaration") return [];
      return getChildren(declaration, "declarations").flatMap((variable) => {
        const identifier = getChild(variable, "id");
        const name = getName(identifier);
        return name === undefined ? [] : [[name, variable] as const];
      });
    }),
  );
}

function pageActionHandlers(action: Readonly<AstNode>): AstNode[] {
  const initializer = getChild(action, "init");
  return initializer?.type === "ObjectExpression"
    ? getChildren(initializer, "properties").flatMap((property) => {
        const handler = getChild(property, "value");
        return handler ? [handler] : [];
      })
    : [initializer].filter((handler) => handler !== undefined);
}

function hasInferredProps(program: Readonly<AstNode>): boolean {
  return getChildren(program, "body").some((statement) => {
    if (statement.type !== "ExportNamedDeclaration") return false;
    const declaration = getChild(statement, "declaration");
    if (declaration?.type !== "TSTypeAliasDeclaration") return false;
    if (getName(getChild(declaration, "id")) !== "Props") return false;
    const annotation = getChild(declaration, "typeAnnotation");
    if (annotation?.type !== "TSTypeReference") return false;
    if (getName(getChild(annotation, "typeName")) !== "InferProps") {
      return false;
    }
    const typeArguments = getChild(annotation, "typeArguments");
    const [parameter] = getChildren(typeArguments, "params");
    return (
      parameter?.type === "TSTypeQuery" &&
      getName(getChild(parameter, "exprName")) === "loader"
    );
  });
}

const pageServerExports = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Keep Void page handlers in canonical server modules",
    },
    messages: {
      handler: "Export page loaders and actions with `defineHandler`.",
      props: "Export `Props = InferProps<typeof loader>` with a page loader.",
      action:
        "Use either the `action` export or the `actions` export, not both.",
    },
  },
  create(context) {
    if (!isPageServerFile(context.filename)) return {};
    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        const exports = exportedVariables(input);
        const loader = exports.get("loader");
        if (loader) {
          if (
            !importsVoidNames(input, new Set(["defineHandler"])) ||
            !isDefineHandlerCall(getChild(loader, "init"))
          ) {
            context.report({ node: loader, messageId: "handler" });
          }
          if (
            !importsVoidNames(input, new Set(["InferProps"])) ||
            !hasInferredProps(input)
          ) {
            context.report({ node: loader, messageId: "props" });
          }
        }

        const action = exports.get("action");
        const actions = exports.get("actions");
        if (action && actions) {
          context.report({ node: actions, messageId: "action" });
        }
        for (const actionExport of [action, actions]) {
          if (!actionExport) continue;
          for (const handler of pageActionHandlers(actionExport)) {
            if (
              !importsVoidNames(input, new Set(["defineHandler"])) ||
              !isDefineHandlerCall(handler)
            ) {
              context.report({ node: handler, messageId: "handler" });
            }
          }
        }
      },
    };
  },
});

const staticPageLayout = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Keep Void page layout selection static and supported",
    },
    messages: {
      layout: "Export `layout` as a string name or `false`.",
    },
  },
  create(context: Readonly<RuleContext>) {
    if (!/(?:^|[/\\])pages(?:[/\\]).+\.[jt]sx?$/u.test(context.filename)) {
      return {};
    }
    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        const layout = exportedVariables(input).get("layout");
        if (!layout) return;
        const value = getChild(layout, "init");
        if (
          value?.type === "Literal" &&
          (typeof getField(value, "value") === "string" ||
            getField(value, "value") === false)
        ) {
          return;
        }
        context.report({ node: value ?? layout, messageId: "layout" });
      },
    };
  },
});

export default definePlugin({
  meta: { name: "void-pages-routing" },
  rules: {
    "page-server-exports": pageServerExports,
    "static-page-layout": staticPageLayout,
  },
});
