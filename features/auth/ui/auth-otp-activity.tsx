import type { ReactElement } from "react";
import type { useAuthForm } from "../use-auth-form";
import AuthOtpActions from "./auth-otp-actions";
import AuthOtpForm from "./auth-otp-form";
import AuthOtpNotice from "./auth-otp-notice";

type AuthOtpActivityProps = { auth: ReturnType<typeof useAuthForm> };

export default function AuthOtpActivity({
  auth,
}: Readonly<AuthOtpActivityProps>): ReactElement {
  return (
    <div className="mt-7 space-y-5">
      <AuthOtpNotice
        email={auth.email}
        isSent={auth.isOtpSent}
      />
      <AuthOtpForm auth={auth} />
      <AuthOtpActions auth={auth} />
    </div>
  );
}
