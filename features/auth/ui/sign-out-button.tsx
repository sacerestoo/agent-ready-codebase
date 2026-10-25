import Button from "@/shared/ui/button";
import { useState, type ReactElement } from "react";
import { handleSignOut } from "../sign-out";

export default function SignOutButton(): ReactElement {
  const [error, setError] = useState("");
  const onSignOut = (): void => {
    setError("");
    handleSignOut().catch((): void => {
      setError("Sign out failed. Please try again.");
    });
  };

  return (
    <>
      <Button
        onClick={onSignOut}
        size="sm"
        type="button"
        variant="outline"
      >
        Sign out
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
