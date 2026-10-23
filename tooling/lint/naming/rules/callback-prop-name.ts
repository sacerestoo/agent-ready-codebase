import { defineRule } from "vite-plus/lint/plugins";
import {
  getChild,
  getChildren,
  getName,
  isAstNode,
  visit,
  type AstNode,
} from "../ast-utils.ts";
import { callbackNamePattern } from "../patterns.ts";

function isCallableType(
  node: unknown,
  callbackTypes: readonly string[],
): boolean {
  if (!isAstNode(node)) return false;
  if (node.type === "TSFunctionType") return true;
  if (node.type === "TSTypeReference") {
    const typeName = getChild(node, "typeName");
    const name = getName(typeName);
    return name !== undefined && callbackTypes.includes(name);
  }
  if (
    node.type === "TSUnionType" ||
    node.type === "TSIntersectionType" ||
    node.type === "TSParenthesizedType"
  ) {
    return (
      getChildren(node, "types").some((type) =>
        isCallableType(type, callbackTypes),
      ) ||
      isCallableType(
        getChild(getChild(node, "typeAnnotation"), "typeAnnotation"),
        callbackTypes,
      )
    );
  }

  return false;
}

function collectCallbackTypes(
  program: Readonly<AstNode> | undefined,
): readonly string[] {
  const callbackTypes = new Set<string>();
  const aliases: Readonly<AstNode>[] = [];
  visit(program, (node) => {
    if (node.type === "TSTypeAliasDeclaration") aliases.push(node);
  });

  let changed = true;

  while (changed) {
    changed = false;
    for (const node of aliases) {
      const id = getChild(node, "id");
      const name = getName(id);
      if (
        name !== undefined &&
        !callbackTypes.has(name) &&
        isCallableType(getChild(node, "typeAnnotation"), [...callbackTypes])
      ) {
        callbackTypes.add(name);
        changed = true;
      }
    }
  }

  return [...callbackTypes];
}

const callbackPropName = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Require callback props to start with on" },
    messages: {
      callbackProp:
        "Callback props must use the onX name form, such as onSubmit.",
    },
  },
  create(context) {
    let program: AstNode | undefined;

    return {
      Program(input: unknown): void {
        if (!isAstNode(input)) return;
        const node = input;
        program = node;
      },
      "Program:exit"(): void {
        const callbackTypes = collectCallbackTypes(program);

        visit(program, (node) => {
          const key = getChild(node, "key");
          if (node.type === "TSMethodSignature") {
            if (key && !callbackNamePattern.test(getName(key) ?? "")) {
              context.report({ node: key, messageId: "callbackProp" });
            }
            return;
          }

          if (node.type !== "TSPropertySignature") return;

          const type = getChild(
            getChild(node, "typeAnnotation"),
            "typeAnnotation",
          );
          if (
            isCallableType(type, callbackTypes) &&
            key &&
            !callbackNamePattern.test(getName(key) ?? "")
          ) {
            context.report({ node: key, messageId: "callbackProp" });
          }
        });
      },
    };
  },
});

export default callbackPropName;
