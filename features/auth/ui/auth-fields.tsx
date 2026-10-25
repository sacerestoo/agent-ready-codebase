import type Input from "@/shared/ui/input";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import Field from "@/shared/ui/field";
import InputGroup from "@/shared/ui/input-group";
import InputGroupInput from "@/shared/ui/input-group-input";
import Label from "@/shared/ui/label";
import type { useAuthForm } from "../use-auth-form";

type AuthFieldsProps = { auth: ReturnType<typeof useAuthForm> };

const authField = ({
  label,
  input,
}: Readonly<{
  label: ReactNode;
  input: Readonly<ComponentProps<typeof Input>>;
}>): ReactElement => (
  <Field>
    <Label htmlFor={input.id}>{label}</Label>
    <InputGroup>
      <InputGroupInput
        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        {...input}
      />
    </InputGroup>
  </Field>
);

export default function AuthFields({
  auth,
}: Readonly<AuthFieldsProps>): ReactElement {
  return (
    <>
      {authField({
        label: "이메일",
        input: {
          id: "auth-email",
          autoComplete: "email",
          onChange: auth.onEmailChange,
          required: true,
          type: "email",
          value: auth.email,
        },
      })}
      {auth.isOtpSent &&
        authField({
          label: "이메일 인증 코드",
          input: {
            id: "auth-otp",
            autoComplete: "one-time-code",
            inputMode: "numeric",
            onChange: auth.onOtpChange,
            required: true,
            value: auth.otp,
          },
        })}
    </>
  );
}
