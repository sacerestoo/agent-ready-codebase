import type { ReactNode } from "react";
import type { BillingSettings } from "../billing-settings";
import { useBillingDemo } from "../use-billing-demo";
import SubscriptionPanel from "./subscription-panel";

export default function BillingDemo({
  billing,
}: Readonly<{ billing: BillingSettings }>): ReactNode {
  const demo = useBillingDemo(billing);

  return (
    <section className="w-full max-w-xl rounded-xl border bg-background p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Creem Billing Demo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Test subscription payments and check your subscription status.
      </p>
      {!billing.ready && (
        <p className="mt-4 text-sm text-destructive">
          Configure your Creem API key and webhook secret to continue.
        </p>
      )}
      {billing.subscriptionsEnabled && (
        <SubscriptionPanel
          billing={billing}
          demo={demo}
        />
      )}
      {demo.error && (
        <p className="mt-4 text-sm text-destructive">{demo.error.message}</p>
      )}
      {demo.isBusy && (
        <p className="mt-4 text-sm text-muted-foreground">Processing...</p>
      )}
    </section>
  );
}
