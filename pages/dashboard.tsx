import type { ReactElement } from "react";
import { SignOutButton } from "@/features/auth";
import { Heading } from "@/shared/ui/typography";
import type { Props } from "./dashboard.server";

export default function DashboardPage({ user }: Readonly<Props>): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <Heading
        as="h1"
        size={6}
      >
        Welcome, {user.name}
      </Heading>
      <SignOutButton />
    </main>
  );
}
