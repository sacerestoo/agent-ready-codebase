import {
  useState,
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  type SubmitEventHandler,
} from "react";
import { authClient } from "../../auth-client";

type AuthResult = Readonly<{
  error?: Readonly<{ message?: string | null }> | null;
}>;
type AuthResultPromise = Readonly<Promise<AuthResult>>;

export type AuthFormState = {
  email: string;
  isEmailInvalid: boolean;
  otp: string;
  error: string;
  isSubmitting: boolean;
  isOtpSent: boolean;
  onResendOtp: () => void;
  onUseAnotherEmail: () => void;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onOtpChange: (otp: string) => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  onGoogleSignIn: () => void;
};

const handleAuthRequest = async (
  request: AuthResultPromise,
  setError: Dispatch<SetStateAction<string>>,
  setIsSubmitting: Dispatch<SetStateAction<boolean>>,
  onSuccess: "sent" | "otp-verified" | "social",
  setIsOtpSent: Dispatch<SetStateAction<boolean>>,
): Promise<void> => {
  setError("");
  setIsSubmitting(true);
  try {
    const result = await request;
    if (result.error) {
      setError(result.error.message ?? "The request failed. Please try again.");
      return;
    }
    if (onSuccess === "sent") {
      setIsOtpSent(true);
      return;
    }
    if (onSuccess === "otp-verified") window.location.assign("/dashboard");
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

type AuthFormActionsInput = Readonly<{
  email: string;
  otp: string;
  isOtpSent: boolean;
  setIsEmailInvalid: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsOtpSent: Dispatch<SetStateAction<boolean>>;
  setOtp: Dispatch<SetStateAction<string>>;
}>;

const createSubmitHandler =
  ({
    email,
    otp,
    isOtpSent,
    setIsEmailInvalid,
    setError,
    setIsSubmitting,
    setIsOtpSent,
  }: AuthFormActionsInput): SubmitEventHandler<HTMLFormElement> =>
  (event): void => {
    event.preventDefault();
    if (!isOtpSent && !event.currentTarget.checkValidity()) {
      setIsEmailInvalid(true);
      return;
    }
    setIsEmailInvalid(false);
    void handleAuthRequest(
      isOtpSent
        ? authClient.signIn.emailOtp({ email, otp })
        : authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" }),
      setError,
      setIsSubmitting,
      isOtpSent ? "otp-verified" : "sent",
      setIsOtpSent,
    );
  };

const createGoogleSignInHandler =
  ({
    setError,
    setIsSubmitting,
    setIsOtpSent,
  }: AuthFormActionsInput): (() => void) =>
  (): void => {
    void handleAuthRequest(
      authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      }),
      setError,
      setIsSubmitting,
      "social",
      setIsOtpSent,
    );
  };

const createAuthFormActions = (
  input: AuthFormActionsInput,
): Pick<
  AuthFormState,
  | "onSubmit"
  | "onGoogleSignIn"
  | "onResendOtp"
  | "onUseAnotherEmail"
  | "onOtpChange"
> => ({
  onSubmit: createSubmitHandler(input),
  onGoogleSignIn: createGoogleSignInHandler(input),
  onResendOtp: (): void => {
    void handleAuthRequest(
      authClient.emailOtp.sendVerificationOtp({
        email: input.email,
        type: "sign-in",
      }),
      input.setError,
      input.setIsSubmitting,
      "sent",
      input.setIsOtpSent,
    );
  },
  onUseAnotherEmail: (): void => {
    input.setIsOtpSent(false);
    input.setOtp("");
    input.setError("");
    input.setIsEmailInvalid(false);
  },
  onOtpChange: (value: string): void => {
    input.setOtp(value);
    input.setError("");
  },
});

export const useAuthForm = (): AuthFormState => {
  const [email, setEmail] = useState("");
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  return {
    email,
    isEmailInvalid,
    otp,
    error,
    isSubmitting,
    isOtpSent,
    onEmailChange: (event): void => {
      setEmail(event.currentTarget.value);
      if (isEmailInvalid) {
        setIsEmailInvalid(!event.currentTarget.validity.valid);
      }
    },
    ...createAuthFormActions({
      email,
      otp,
      isOtpSent,
      setIsEmailInvalid,
      setError,
      setIsSubmitting,
      setIsOtpSent,
      setOtp,
    }),
  };
};
