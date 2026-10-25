import { useMutation, useQuery } from "@tanstack/react-query";
import { fetch } from "void/client";
import { auth } from "void/client/react";
import type { BillingSettings } from "./billing-settings";
import { getCreemCustomerId } from "./customer";
import { subscriptionQueryOptions } from "./queries";

type BillingQueries = {
  access: ReturnType<typeof useQuery<boolean>>;
  session: ReturnType<typeof auth.useSession>;
};

function useBillingQueries(billing: BillingSettings): BillingQueries {
  return {
    access: useQuery(
      subscriptionQueryOptions(
        billing.subscriptionsEnabled &&
          billing.ready &&
          billing.subscriptionProductReady,
      ),
    ),
    session: auth.useSession(),
  };
}

type CheckoutActions = {
  checkoutError: Error | null;
  portalError: Error | null;
  isCheckoutPending: boolean;
  isPortalPending: boolean;
  onBuySubscription: () => void;
  onManagePayments: () => void;
};

function useCheckoutActions(): CheckoutActions {
  const checkout = useMutation({
    mutationFn: async (): Promise<void> => {
      const result = await fetch("/api/billing/checkout", {
        method: "POST",
        body: {},
      });
      window.location.assign(result.url);
    },
  });
  const portal = useMutation({
    mutationFn: async (): Promise<void> => {
      const result = await fetch("/api/billing/portal", {
        method: "POST",
        body: {},
      });
      window.location.assign(result.url);
    },
  });

  return {
    checkoutError: checkout.error,
    portalError: portal.error,
    isCheckoutPending: checkout.isPending,
    isPortalPending: portal.isPending,
    onBuySubscription: (): void => {
      checkout.mutate();
    },
    onManagePayments: (): void => {
      portal.mutate();
    },
  };
}

export const useBillingDemo = (
  billing: BillingSettings,
): ReturnType<typeof useBillingQueries> &
  ReturnType<typeof useCheckoutActions> & {
    error: Error | null;
    isBusy: boolean;
    isRefreshingSubscription: boolean;
    customerId: string | undefined;
    onRefreshSubscription: () => void;
  } => {
  const queries = useBillingQueries(billing);
  const checkout = useCheckoutActions();

  return {
    ...queries,
    ...checkout,
    error:
      checkout.checkoutError ?? checkout.portalError ?? queries.access.error,
    isBusy: checkout.isCheckoutPending || checkout.isPortalPending,
    isRefreshingSubscription: queries.access.isFetching,
    customerId: queries.session.data
      ? getCreemCustomerId(queries.session.data.user)
      : undefined,
    onRefreshSubscription: (): void => {
      void queries.access.refetch();
    },
  };
};
