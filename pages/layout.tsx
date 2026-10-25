import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import "@/styles/globals.css";
import "@/styles/loading.css";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  const [queryClient] = useState(
    (): QueryClient =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
