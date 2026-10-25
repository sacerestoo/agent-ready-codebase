import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import { authClient } from "../../auth-client";

export const subscriptionQueryKey = () => ["billing", "subscription"] as const;

export const subscriptionQueryOptions = (
  enabled: boolean,
): UseQueryOptions<
  boolean,
  Error,
  boolean,
  ReturnType<typeof subscriptionQueryKey>
> =>
  queryOptions({
    queryKey: subscriptionQueryKey(),
    queryFn: async (): Promise<boolean> => {
      const result = await authClient.creem.hasAccessGranted();
      if (result.error) throw new Error(result.error.message);
      return result.data?.hasAccessGranted ?? false;
    },
    enabled,
  });
