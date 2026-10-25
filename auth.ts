import { creem } from "@creem_io/better-auth";
import { defineAuth } from "void/auth";

export default defineAuth(({ defaults, env }) => {
  const apiKey = env.CREEM_API_KEY;
  const webhookSecret = env.CREEM_WEBHOOK_SECRET;
  const testMode = String(env.CREEM_TEST_MODE) === "true";

  if (typeof apiKey !== "string" || typeof webhookSecret !== "string") {
    return defaults;
  }

  return {
    ...defaults,
    plugins: [
      ...(defaults.plugins ?? []),
      creem({
        apiKey,
        webhookSecret,
        testMode,
        persistSubscriptions: true,
        defaultSuccessUrl: "/",
      }),
    ],
    disabledPaths: [
      ...(defaults.disabledPaths ?? []),
      "/creem/create-checkout",
      "/creem/cancel-subscription",
      "/creem/retrieve-subscription",
      "/creem/search-transactions",
    ],
  };
});
