import type { ReactNode } from "react";
import { AuthForm, SignOutButton } from "@/features/auth";
import { BillingDemo } from "@/features/billing";
import type { Props } from "./index.server";

export default function HomePage({
  user,
  billing,
}: Readonly<Props>): ReactNode {
  return user ? (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <SignOutButton />
      {billing.subscriptionsEnabled && <BillingDemo billing={billing} />}
    </main>
  ) : (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <AuthForm />
    </main>
  );
}
