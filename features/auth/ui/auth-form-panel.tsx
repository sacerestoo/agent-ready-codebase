import type {
  ChangeEventHandler,
  ReactElement,
  SubmitEventHandler,
} from "react";
import AuthFormBody from "./auth-form-body";

type AuthFormPanelProps = {
  email: string;
  error: string;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onModeToggle: () => void;
  onNameChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  isSigningUp: boolean;
  isSubmitting: boolean;
  name: string;
  password: string;
};

export default function AuthFormPanel(
  props: Readonly<AuthFormPanelProps>,
): ReactElement {
  return (
    <section className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-sm sm:p-9">
      <h1 className="text-3xl font-semibold tracking-tight">
        {props.isSigningUp ? "계정 만들기" : "로그인"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        로그인하면 내 할 일을 안전하게 저장할 수 있어요.
      </p>
      <AuthFormBody {...props} />
    </section>
  );
}
