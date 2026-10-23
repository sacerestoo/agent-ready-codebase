import { definePlugin } from "vite-plus/lint/plugins";
import callbackPropName from "./rules/callback-prop-name.ts";
import componentDefaultExport from "./rules/component-default-export.ts";
import componentHandlerName from "./rules/component-handler-name.ts";
import customHookName from "./rules/custom-hook-name.ts";
import camelCaseIdentifiers, {
  pascalCaseTypes,
} from "./rules/identifier-case.ts";
import noElse from "./rules/no-else.ts";
import noEnum from "./rules/no-enum.ts";
import noJavascriptFiles from "./rules/no-javascript-files.ts";
import nonJsxFunctionExportConst from "./rules/non-jsx-function-export-const.ts";

export default definePlugin({
  meta: { name: "naming" },
  rules: {
    "no-javascript-files": noJavascriptFiles,
    "no-enum": noEnum,
    "no-else": noElse,
    "component-default-export": componentDefaultExport,
    "custom-hook-name": customHookName,
    "camel-case-identifiers": camelCaseIdentifiers,
    "callback-prop-name": callbackPropName,
    "component-handler-name": componentHandlerName,
    "non-jsx-function-export-const": nonJsxFunctionExportConst,
    "pascal-case-types": pascalCaseTypes,
  },
});
