import type { ReactElement } from "react";
import Button from "@/shared/ui/button";
import type { useAuthForm } from "../use-auth-form";
import AuthFields from "./auth-fields";

type AuthEmailActivityProps = { auth: ReturnType<typeof useAuthForm> };

export default function AuthEmailActivity({
  auth,
}: Readonly<AuthEmailActivityProps>): ReactElement {
  return (
    <>
      <form
        className="mt-7 space-y-4"
        noValidate
        onSubmit={auth.onSubmit}
      >
        <AuthFields auth={auth} />
        {auth.error && (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {auth.error}
          </p>
        )}
      </form>
      <Button
        className="mt-3 w-full"
        disabled={auth.isSubmitting}
        pending={auth.isSubmitting}
        size="xl"
        onClick={auth.onGoogleSignIn}
        type="button"
        variant="outline"
      >
        <img
          aria-hidden="true"
          className="size-4"
          src="/google-icon.svg"
          alt=""
        />
        Continue with Google
      </Button>
    </>
  );
}
