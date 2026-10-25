import type { ReactElement } from "react";
import { CircleCheck } from "lucide-react";

export default function AuthOtpNotice({
  email,
  isSent,
}: Readonly<{ email: string; isSent: boolean }>): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <span
        className="t-success-check auth-success self-start"
        data-state={isSent ? "in" : "out"}
        aria-hidden="true"
      >
        <CircleCheck className="size-9" />
      </span>
      <p className="text-sm text-balance text-muted-foreground">
        We sent a sign-in code to{" "}
        <strong className="font-medium text-foreground">{email}</strong>. Check
        your inbox and enter the code below.
      </p>
    </div>
  );
}
