import type { ReactNode } from "react";
import Button from "@/shared/ui/button";

export default function HomePage(): ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex gap-3">
        <Button
          variant={"outline"}
          render={<a href="/dashboard" />}
        >
          Dashboard
        </Button>
        <Button
          variant={"outline"}
          render={<a href="/sign-in" />}
        >
          Sign in
        </Button>
      </div>
    </main>
  );
}
