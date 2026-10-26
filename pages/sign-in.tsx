import type { ReactElement } from "react";
import AuthForm from "@/features/auth/ui/auth-form";

export default function SignInPage(): ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <AuthForm />
    </main>
  );
}
