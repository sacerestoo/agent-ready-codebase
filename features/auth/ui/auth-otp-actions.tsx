import type { ReactElement } from "react";
import Button from "@/shared/ui/button";
import type { useAuthForm } from "../use-auth-form";

type AuthOtpActionsProps = { auth: ReturnType<typeof useAuthForm> };

export default function AuthOtpActions({
  auth,
}: Readonly<AuthOtpActionsProps>): ReactElement {
  return (
    <div className="-mx-2 flex flex-col items-start gap-1 text-muted-foreground">
      <Button
        disabled={auth.isSubmitting}
        onClick={auth.onResendOtp}
        size="sm"
        type="button"
        variant="ghost"
        className="font-normal"
      >
        Resend code
      </Button>
      <Button
        disabled={auth.isSubmitting}
        onClick={auth.onUseAnotherEmail}
        size="sm"
        type="button"
        variant="ghost"
        className="font-normal"
      >
        Use another email
      </Button>
    </div>
  );
}
