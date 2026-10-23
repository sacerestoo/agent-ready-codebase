import { defineRule } from "vite-plus/lint/plugins";
import {
  containsJsx,
  getChild,
  getChildren,
  getField,
  getName,
  getString,
  isAstNode,
  visit,
  type AstNode,
} from "../ast-utils.ts";
import { componentNamePattern } from "../patterns.ts";

const camelCasePattern = /^[a-z][A-Za-z0-9]*$/u;
const pascalCasePattern = /^[A-Z][A-Za-z0-9]*$/u;
const httpMethods = new Set([
  "CONNECT",
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
  "TRACE",
]);

type RuleContext = Parameters<
  NonNullable<Parameters<typeof defineRule>[0]["create"]>
>[0];

function getBindingNames(node: unknown): AstNode[] {
  if (!isAstNode(node)) return [];
  if (node.type === "Identifier") return [node];
  if (node.type === "RestElement")
    return getBindingNames(getChild(node, "argument"));
  if (node.type === "AssignmentPattern")
    return getBindingNames(getChild(node, "left"));
  if (node.type === "ArrayPattern")
    return getChildren(node, "elements").flatMap((element) =>
      getBindingNames(element),
    );
  if (node.type === "ObjectPattern") {
    return getChildren(node, "properties").flatMap((property) =>
      property.type === "RestElement"
        ? getBindingNames(getChild(property, "argument"))
        : getBindingNames(getChild(property, "value")),
    );
  }

  return [];
}

function checkCamelCase(
  context: Readonly<RuleContext>,
  node: unknown,
  allowHttpMethod = false,
): void {
  if (!isAstNode(node)) return;
  const name = getName(node);
  if (
    name === undefined ||
    name === "" ||
    (allowHttpMethod && httpMethods.has(name)) ||
    camelCasePattern.test(name)
  ) {
    return;
  }

  context.report({
    node,
    message: `Identifier "${name}" must use camelCase.`,
  });
}

function checkPascalCase(context: Readonly<RuleContext>, node: unknown): void {
  if (!isAstNode(node)) return;
  const name = getName(node);
  if (name === undefined || name === "" || pascalCasePattern.test(name)) return;

  context.report({
    node,
    message: `Identifier "${name}" must use PascalCase.`,
  });
}

function checkProgram(
  defaultComponentFunctions: WeakSet<object>,
  input: unknown,
): void {
  if (!isAstNode(input)) return;
  visit(input, (child) => {
    const declaration = getChild(child, "declaration");
    if (
      child.type === "ExportDefaultDeclaration" &&
      declaration?.type === "FunctionDeclaration" &&
      getChild(declaration, "id") &&
      containsJsx(getChild(declaration, "body"))
    ) {
      defaultComponentFunctions.add(declaration);
    }
  });
}

function checkParameters(context: Readonly<RuleContext>, input: unknown): void {
  if (!isAstNode(input)) return;
  for (const parameter of getChildren(input, "params")) {
    for (const identifier of getBindingNames(parameter)) {
      checkCamelCase(context, identifier);
    }
  }
}

function createProgramListeners(
  context: Readonly<RuleContext>,
  defaultComponentFunctions: WeakSet<object>,
) {
  return {
    Program(input: unknown): void {
      checkProgram(defaultComponentFunctions, input);
    },
    VariableDeclarator(input: unknown): void {
      if (!isAstNode(input)) return;
      for (const identifier of getBindingNames(getChild(input, "id"))) {
        checkCamelCase(context, identifier, true);
      }
    },
    CatchClause(input: unknown): void {
      if (isAstNode(input)) {
        for (const identifier of getBindingNames(getChild(input, "param"))) {
          checkCamelCase(context, identifier);
        }
      }
    },
  };
}

function createFunctionListeners(
  context: Readonly<RuleContext>,
  defaultComponentFunctions: WeakSet<object>,
) {
  return {
    FunctionDeclaration(input: unknown): void {
      if (!isAstNode(input)) return;
      const id = getChild(input, "id");
      const isPascalCaseComponent =
        componentNamePattern.test(getString(id, "name") ?? "") &&
        containsJsx(getChild(input, "body"));
      if (
        id &&
        !defaultComponentFunctions.has(input) &&
        !isPascalCaseComponent
      ) {
        checkCamelCase(context, id);
      }
      checkParameters(context, input);
    },
    FunctionExpression(input: unknown): void {
      if (!isAstNode(input)) return;
      const id = getChild(input, "id");
      if (id) checkCamelCase(context, id);
      checkParameters(context, input);
    },
    ArrowFunctionExpression(input: unknown): void {
      checkParameters(context, input);
    },
    TSMethodSignature: (input: unknown): void => {
      if (!isAstNode(input)) return;
      const key = getChild(input, "key");
      if (key?.type === "Identifier") checkCamelCase(context, key);
      checkParameters(context, input);
    },
    TSFunctionType(input: unknown): void {
      checkParameters(context, input);
    },
    TSCallSignatureDeclaration(input: unknown): void {
      checkParameters(context, input);
    },
    TSConstructSignatureDeclaration(input: unknown): void {
      checkParameters(context, input);
    },
  };
}

function createDeclarationListeners(context: Readonly<RuleContext>) {
  const checkId = (input: unknown, key: string): void => {
    if (isAstNode(input)) checkCamelCase(context, getChild(input, key));
  };
  return {
    ClassDeclaration(input: unknown): void {
      checkId(input, "id");
    },
    ClassExpression(input: unknown): void {
      checkId(input, "id");
    },
    TSEnumDeclaration(input: unknown): void {
      checkId(input, "id");
    },
  };
}

function createPropertyListeners(context: Readonly<RuleContext>) {
  const checkPropertyKey = (input: unknown, allowShorthand: boolean): void => {
    if (!isAstNode(input)) return;
    const key = getChild(input, "key");
    if (
      getField(input, "computed") !== true &&
      (allowShorthand || getField(input, "shorthand") !== true) &&
      key?.type === "Identifier"
    ) {
      checkCamelCase(context, key);
    }
  };
  return {
    Property(input: unknown): void {
      checkPropertyKey(input, false);
    },
    MethodDefinition(input: unknown): void {
      checkPropertyKey(input, true);
    },
    TSPropertySignature(input: unknown): void {
      if (!isAstNode(input)) return;
      const key = getChild(input, "key");
      if (key?.type === "Identifier") checkCamelCase(context, key);
    },
  };
}

const camelCaseIdentifiers = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Require case conventions for local identifiers" },
  },
  create(context) {
    const defaultComponentFunctions = new WeakSet();
    return Object.assign(
      createProgramListeners(context, defaultComponentFunctions),
      createFunctionListeners(context, defaultComponentFunctions),
      createDeclarationListeners(context),
      createPropertyListeners(context),
    );
  },
});

export const pascalCaseTypes = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Require PascalCase for type declarations" },
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node: unknown): void {
        if (isAstNode(node)) checkPascalCase(context, getChild(node, "id"));
      },
      TSInterfaceDeclaration(node: unknown): void {
        if (isAstNode(node)) checkPascalCase(context, getChild(node, "id"));
      },
      TSTypeParameter(node: unknown): void {
        if (isAstNode(node)) checkPascalCase(context, getChild(node, "name"));
      },
    };
  },
});

export default camelCaseIdentifiers;
