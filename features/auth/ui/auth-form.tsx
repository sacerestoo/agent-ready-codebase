import { Heading } from "@/shared/ui/typography";
import { Activity, type ReactElement } from "react";
import { useAuthForm } from "../use-auth-form";
import AuthEmailActivity from "./auth-email-activity";
import AuthOtpActivity from "./auth-otp-activity";

export default function AuthForm(): ReactElement {
  const auth = useAuthForm();
  return (
    <section className="w-full max-w-md rounded-3xl p-7 sm:p-9">
      <Activity mode={auth.isOtpSent ? "hidden" : "visible"}>
        <Heading
          as="h1"
          size={6}
        >
          Welcome
        </Heading>
        <AuthEmailActivity auth={auth} />
      </Activity>
      <Activity mode={auth.isOtpSent ? "visible" : "hidden"}>
        <AuthOtpActivity auth={auth} />
      </Activity>
    </section>
  );
}
