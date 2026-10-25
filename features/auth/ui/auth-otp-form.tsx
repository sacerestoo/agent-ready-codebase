import type { ReactElement } from "react";
import Button from "@/shared/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import type { useAuthForm } from "../use-auth-form";

type AuthOtpFormProps = { auth: ReturnType<typeof useAuthForm> };

export default function AuthOtpForm({
  auth,
}: Readonly<AuthOtpFormProps>): ReactElement {
  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={auth.onSubmit}
    >
      <InputOTP
        className="justify-center"
        aria-label="Verification code"
        aria-invalid={auth.error ? true : undefined}
        autoComplete="one-time-code"
        maxLength={6}
        onChange={auth.onOtpChange}
        value={auth.otp}
      >
        <InputOTPGroup
          className="w-full justify-between"
          data-invalid={auth.error ? "true" : undefined}
          size="2xl"
        >
          {[0, 1, 2, 3, 4, 5].map((index): ReactElement => (
            <InputOTPSlot
              index={index}
              key={index}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Button
        className="w-full"
        disabled={auth.otp.length !== 6 || auth.isSubmitting}
        pending={auth.isSubmitting}
        size="xl"
        type="submit"
        variant="outline"
      >
        Verify code
      </Button>
    </form>
  );
}
