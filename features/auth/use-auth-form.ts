import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { authClient } from "../../auth-client";

type AuthResult = Readonly<{
  error?: Readonly<{ message?: string | null }> | null;
}>;
type AuthResultPromise = Readonly<Promise<AuthResult>>;

const valueChange =
  (setValue: (value: string) => void): ChangeEventHandler<HTMLInputElement> =>
  (event): void => {
    setValue(event.currentTarget.value);
  };

type AuthFormState = {
  email: string;
  otp: string;
  error: string;
  isSubmitting: boolean;
  isOtpSent: boolean;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onOtpChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  onGoogleSignIn: () => void;
};

const handleAuthRequest = async (
  request: AuthResultPromise,
  setError: (error: string) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
  onSuccess: "reload" | "sent" | "redirect",
  setIsOtpSent: (sent: boolean) => void,
): Promise<void> => {
  setError("");
  setIsSubmitting(true);
  try {
    const result = await request;
    if (result.error) {
      setError(result.error.message ?? "요청에 실패했습니다.");
      return;
    }
    if (onSuccess === "sent") {
      setIsOtpSent(true);
      return;
    }
    if (onSuccess === "reload") window.location.reload();
  } catch {
    setError("요청을 처리하지 못했습니다. 다시 시도해 주세요.");
  } finally {
    setIsSubmitting(false);
  }
};

export const useAuthForm = (): AuthFormState => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const onEmailChange = valueChange(setEmail);
  const onOtpChange = valueChange(setOtp);
  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event): void => {
    event.preventDefault();
    const request = isOtpSent
      ? authClient.signIn.emailOtp({
          email,
          otp,
        })
      : authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    void handleAuthRequest(
      request,
      setError,
      setIsSubmitting,
      isOtpSent ? "reload" : "sent",
      setIsOtpSent,
    );
  };
  const onGoogleSignIn = (): void => {
    void handleAuthRequest(
      authClient.signIn.social({ provider: "google", callbackURL: "/" }),
      setError,
      setIsSubmitting,
      "redirect",
      setIsOtpSent,
    );
  };
  return {
    email,
    otp,
    error,
    isSubmitting,
    isOtpSent,
    onEmailChange,
    onOtpChange,
    onSubmit,
    onGoogleSignIn,
  };
};
