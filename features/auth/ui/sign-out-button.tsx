import Button from "@/shared/ui/button";
import { useState, type ReactElement } from "react";
import { handleSignOut } from "../sign-out";

export default function SignOutButton(): ReactElement {
  const [error, setError] = useState("");
  const onSignOut = (): void => {
    setError("");
    handleSignOut().catch((): void => {
      setError("로그아웃에 실패했습니다. 다시 시도해 주세요.");
    });
  };

  return (
    <>
      <Button
        className="border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
        onClick={onSignOut}
        size="sm"
        type="button"
        variant="outline"
      >
        로그아웃
      </Button>
      {error && (
        <p
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </>
  );
}
