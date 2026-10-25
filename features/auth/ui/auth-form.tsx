import { useState, type ReactElement } from "react";
import { useAuthRequest, useAuthValues } from "../use-auth-form";
import AuthFormPanel from "./auth-form-panel";

export default function AuthForm(): ReactElement {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const values = useAuthValues();
  const request = useAuthRequest({ ...values, isSigningUp });
  const onModeToggle = (): void => {
    setIsSigningUp(!isSigningUp);
  };
  return (
    <AuthFormPanel
      {...values}
      {...request}
      isSigningUp={isSigningUp}
      onModeToggle={onModeToggle}
    />
  );
}
