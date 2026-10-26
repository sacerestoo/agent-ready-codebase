import { getCreemCustomerId } from "@/features/billing/customer";
import { createCheckout } from "@creem_io/better-auth/server";
import * as v from "valibot";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { env } from "void/env";

export const POST = defineHandler.withValidator({
  body: v.object({}),
})(async (context): Promise<{ url: string } | Response> => {
  const user = requireAuth(context);
  const productId = env.CREEM_SUBSCRIPTION_PRODUCT_ID;
  if (
    String(env.CREEM_SUBSCRIPTIONS_ENABLED) !== "true" ||
    typeof productId !== "string" ||
    productId.length === 0
  ) {
    return context.json({ error: "This payment option is disabled." }, 403);
  }
  if (
    typeof env.CREEM_API_KEY !== "string" ||
    typeof env.CREEM_WEBHOOK_SECRET !== "string"
  ) {
    return context.json({ error: "Creem is not configured." }, 503);
  }

  const customerId = getCreemCustomerId(user);
  const checkout = await createCheckout(
    {
      apiKey: env.CREEM_API_KEY,
      testMode: String(env.CREEM_TEST_MODE) === "true",
    },
    {
      productId,
      customer:
        customerId === undefined ? { email: user.email } : { id: customerId },
      successUrl: new URL("/", context.req.url).toString(),
      metadata: { referenceId: user.id },
      skipTrial: true,
    },
  );

  if (typeof checkout.url !== "string") {
    return context.json({ error: "Creem did not return a checkout URL." }, 502);
  }

  return { url: checkout.url };
});
