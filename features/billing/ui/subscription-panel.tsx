import type { ReactNode } from "react";
import type { BillingSettings } from "../billing-settings";
import type { useBillingDemo } from "../use-billing-demo";
import SubscriptionActions from "./subscription-actions";

type Demo = ReturnType<typeof useBillingDemo>;

export default function SubscriptionPanel({
  billing,
  demo,
}: Readonly<{ billing: BillingSettings; demo: Demo }>): ReactNode {
  return (
    <div className="mt-4 rounded-lg bg-muted/50 p-4">
      <h2 className="font-medium">Subscription</h2>
      <SubscriptionActions
        billing={billing}
        demo={demo}
      />
    </div>
  );
}
