import type { ChangeEventHandler, ReactElement } from "react";

type AuthFieldsProps = {
  email: string;
  onEmailChange: ChangeEventHandler<HTMLInputElement>;
  onNameChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  isSigningUp: boolean;
  name: string;
  password: string;
};

export default function AuthFields({
  email,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  isSigningUp,
  name,
  password,
}: Readonly<AuthFieldsProps>): ReactElement {
  return (
    <>
      {isSigningUp && (
        <label className="block space-y-2 text-sm font-medium">
          이름
          <input
            autoComplete="name"
            className="h-11 w-full rounded-xl border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={80}
            onChange={onNameChange}
            required
            value={name}
          />
        </label>
      )}
      <label className="block space-y-2 text-sm font-medium">
        이메일
        <input
          autoComplete="email"
          className="h-11 w-full rounded-xl border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={onEmailChange}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        비밀번호
        <input
          autoComplete={isSigningUp ? "new-password" : "current-password"}
          className="h-11 w-full rounded-xl border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
          minLength={8}
          onChange={onPasswordChange}
          required
          type="password"
          value={password}
        />
      </label>
    </>
  );
}
