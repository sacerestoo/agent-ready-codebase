import { getCreemCustomerId } from "@/features/billing/customer";
import { createPortal } from "@creem_io/better-auth/server";
import * as v from "valibot";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { env } from "void/env";

export const POST = defineHandler.withValidator({
  body: v.object({}),
})(async (context): Promise<{ url: string } | Response> => {
  const user = requireAuth(context);
  if (
    typeof env.CREEM_API_KEY !== "string" ||
    typeof env.CREEM_WEBHOOK_SECRET !== "string"
  ) {
    return context.json({ error: "Creem is not configured." }, 503);
  }

  const customerId = getCreemCustomerId(user);
  if (customerId === undefined) {
    return context.json(
      { error: "No Creem customer is linked to this account." },
      400,
    );
  }

  const portal = await createPortal(
    {
      apiKey: env.CREEM_API_KEY,
      testMode: String(env.CREEM_TEST_MODE) === "true",
    },
    customerId,
  );

  if (portal.url.length === 0) {
    return context.json({ error: "Creem did not return a portal URL." }, 502);
  }

  return { url: portal.url };
});
