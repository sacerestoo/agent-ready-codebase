import type { ReactNode } from "react";
import type { BillingSettings } from "../billing-settings";
import type { useBillingDemo } from "../use-billing-demo";
import { canStartSubscriptionCheckout } from "../operations";

type Demo = ReturnType<typeof useBillingDemo>;
const primaryButtonClassName =
  "rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50";
const buttonClassName =
  "rounded-md border px-3 py-2 text-sm disabled:opacity-50";

export default function SubscriptionActions({
  billing,
  demo,
}: Readonly<{ billing: BillingSettings; demo: Demo }>): ReactNode {
  const hasAccess = demo.access.data;
  const canSubscribe = canStartSubscriptionCheckout(hasAccess);
  const status =
    hasAccess === undefined
      ? "Checking..."
      : hasAccess
        ? "Active"
        : "No active subscription";
  return billing.subscriptionProductReady ? (
    <>
      <p className="mt-2 text-sm">Status: {status}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={primaryButtonClassName}
          disabled={demo.isBusy || !billing.ready || !canSubscribe}
          onClick={demo.onBuySubscription}
          type="button"
        >
          {canSubscribe ? "Subscribe / resubscribe" : "Subscribed"}
        </button>
        {demo.customerId !== undefined && (
          <button
            className={buttonClassName}
            disabled={demo.isBusy}
            onClick={demo.onManagePayments}
            type="button"
          >
            Manage or cancel subscription
          </button>
        )}
        <button
          className={buttonClassName}
          disabled={demo.isRefreshingSubscription}
          onClick={demo.onRefreshSubscription}
          type="button"
        >
          Refresh status
        </button>
      </div>
    </>
  ) : (
    <p className="mt-2 text-sm text-muted-foreground">
      Set CREEM_SUBSCRIPTION_PRODUCT_ID to enable subscriptions.
    </p>
  );
}
