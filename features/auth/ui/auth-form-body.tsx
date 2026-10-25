import type {
  ChangeEventHandler,
  ReactElement,
  SubmitEventHandler,
} from "react";
import Button from "@/shared/ui/button";
import AuthFields from "./auth-fields";
import AuthModeButton from "./auth-mode-button";

type AuthFormBodyProps = {
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

export default function AuthFormBody(
  props: Readonly<AuthFormBodyProps>,
): ReactElement {
  return (
    <>
      <form
        className="mt-7 space-y-4"
        onSubmit={props.onSubmit}
      >
        <AuthFields {...props} />
        {props.error && (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {props.error}
          </p>
        )}
        <Button
          className="h-11 w-full rounded-xl"
          disabled={props.isSubmitting}
          type="submit"
        >
          {props.isSubmitting
            ? "처리 중…"
            : props.isSigningUp
              ? "회원가입"
              : "로그인"}
        </Button>
      </form>
      <AuthModeButton
        isSigningUp={props.isSigningUp}
        onModeToggle={props.onModeToggle}
      />
    </>
  );
}
