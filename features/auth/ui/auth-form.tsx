import type { ReactElement } from "react";
import Button from "@/shared/ui/button";
import { useAuthForm } from "../use-auth-form";
import AuthFields from "./auth-fields";

export default function AuthForm(): ReactElement {
  const auth = useAuthForm();
  return (
    <section className="w-full max-w-md rounded-3xl p-7 sm:p-9">
      <h1 className="text-3xl font-semibold tracking-tight">
        로그인 / 회원가입
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        이메일을 확인해 기존 계정은 로그인하고, 새 계정은 자동으로 만들어요.
      </p>
      <form
        className="mt-7 space-y-4"
        onSubmit={auth.onSubmit}
      >
        <AuthFields auth={auth} />
        {auth.error && (
          <p
            className="text-sm text-destructive"
            role="alert"
          >
            {auth.error}
          </p>
        )}
        <Button
          className="w-full rounded-xl"
          disabled={!auth.email}
          pending={auth.isSubmitting}
          size="xl"
          type="submit"
        >
          {auth.isOtpSent ? "로그인 또는 가입" : "이메일 코드 보내기"}
        </Button>
      </form>
      <Button
        variant="brand"
        size="2xl"
        className="mt-3 w-full"
        disabled={auth.isSubmitting}
        onClick={auth.onGoogleSignIn}
        type="button"
      >
        Google로 계속하기
      </Button>
    </section>
  );
}
