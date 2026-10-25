import type { BillingSettings } from "@/features/billing";
import { defineHandler, type InferProps } from "void";
import { getUser } from "void/auth";
import { env } from "void/env";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(
  (): { user: ReturnType<typeof getUser>; billing: BillingSettings } => ({
    user: getUser(),
    billing: {
      ready:
        typeof env.CREEM_API_KEY === "string" &&
        typeof env.CREEM_WEBHOOK_SECRET === "string",
      subscriptionsEnabled: String(env.CREEM_SUBSCRIPTIONS_ENABLED) === "true",
      subscriptionProductReady: Boolean(env.CREEM_SUBSCRIPTION_PRODUCT_ID),
    },
  }),
);
