import type { ReactElement } from "react";
import Field from "@/shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/ui/input-group";
import type { useAuthForm } from "../use-auth-form";

type AuthFieldsProps = { auth: ReturnType<typeof useAuthForm> };

export default function AuthFields({
  auth,
}: Readonly<AuthFieldsProps>): ReactElement {
  return (
    <Field>
      <InputGroup
        className="bg-background"
        size="xl"
      >
        <InputGroupInput
          className="bg-transparent shadow-none hover:bg-transparent! focus-visible:ring-0"
          id="auth-email"
          aria-invalid={auth.isEmailInvalid || undefined}
          autoComplete="off"
          onChange={auth.onEmailChange}
          required
          type="email"
          value={auth.email}
          placeholder="Email"
        />
        <InputGroupAddon
          align="inline-end"
          className="pr-1"
        >
          <InputGroupButton
            disabled={!auth.email || auth.isSubmitting}
            pending={auth.isSubmitting}
            type="submit"
            variant="outline"
            size="sm"
            className="h-8 text-primary hover:bg-background! disabled:bg-transparent dark:disabled:bg-transparent"
          >
            Send code
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
