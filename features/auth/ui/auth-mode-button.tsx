import type { ReactElement } from "react";

export default function AuthModeButton({
  isSigningUp,
  onModeToggle,
}: Readonly<{ isSigningUp: boolean; onModeToggle: () => void }>): ReactElement {
  return (
    <button
      className="mt-6 w-full text-center text-sm underline underline-offset-4"
      onClick={onModeToggle}
      type="button"
    >
      {isSigningUp
        ? "이미 계정이 있나요? 로그인"
        : "처음 오셨나요? 계정 만들기"}
    </button>
  );
}
