import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { authClient } from "../../auth-client";

type AuthValues = {
  name: string;
  email: string;
  password: string;
};

type AuthRequest = AuthValues & {
  isSigningUp: boolean;
};

type AuthFormValues = AuthValues & {
  onNameChange: ChangeEventHandler<HTMLInputElement>;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
};

type AuthRequestState = {
  error: string;
  isSubmitting: boolean;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
};

export const useAuthValues = (): AuthFormValues => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onNameChange: ChangeEventHandler<HTMLInputElement> = (event): void => {
    setName(event.currentTarget.value);
  };
  const onEmailChange: ChangeEventHandler<HTMLInputElement> = (event): void => {
    setEmail(event.currentTarget.value);
  };
  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ): void => {
    setPassword(event.currentTarget.value);
  };
  return {
    name,
    email,
    password,
    onNameChange,
    onEmailChange,
    onPasswordChange,
  };
};

export const useAuthRequest = ({
  name,
  email,
  password,
  isSigningUp,
}: Readonly<AuthRequest>): AuthRequestState => {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function submit(): Promise<void> {
    setError("");
    setIsSubmitting(true);
    try {
      const result = isSigningUp
        ? await authClient.signUp.email({ name: name.trim(), email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "로그인에 실패했습니다.");
        return;
      }
      window.location.reload();
    } catch {
      setError("요청을 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }
  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event): void => {
    event.preventDefault();
    void submit();
  };
  return { error, isSubmitting, onSubmit };
};
