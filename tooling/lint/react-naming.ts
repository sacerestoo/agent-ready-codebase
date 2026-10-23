import { definePlugin } from "vite-plus/lint/plugins";
import callbackPropName from "./naming/rules/callback-prop-name.ts";
import componentDefaultExport from "./naming/rules/component-default-export.ts";
import componentHandlerName from "./naming/rules/component-handler-name.ts";
import customHookName from "./naming/rules/custom-hook-name.ts";
import nonJsxFunctionExportConst from "./naming/rules/non-jsx-function-export-const.ts";

export default definePlugin({
  meta: { name: "react-codebase" },
  rules: {
    "component-default-export": componentDefaultExport,
    "custom-hook-name": customHookName,
    "callback-prop-name": callbackPropName,
    "component-handler-name": componentHandlerName,
    "non-jsx-function-export-const": nonJsxFunctionExportConst,
  },
});
