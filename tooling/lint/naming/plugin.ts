import { definePlugin } from "vite-plus/lint/plugins";
import camelCaseIdentifiers, {
  pascalCaseTypes,
} from "./rules/identifier-case.ts";
import noElse from "./rules/no-else.ts";
import noEnum from "./rules/no-enum.ts";
import noJavascriptFiles from "./rules/no-javascript-files.ts";

export default definePlugin({
  meta: { name: "codebase" },
  rules: {
    "no-javascript-files": noJavascriptFiles,
    "no-enum": noEnum,
    "no-else": noElse,
    "camel-case-identifiers": camelCaseIdentifiers,
    "pascal-case-types": pascalCaseTypes,
  },
});
