import type { ReactElement } from "react";
import UserMenu from "@/features/auth/ui/user-menu";

export default function DashboardPage(): ReactElement {
  return (
    <main className="flex min-h-screen justify-end p-4">
      <UserMenu />
    </main>
  );
}
