import type { AuthUser } from "void/auth";

export const getCreemCustomerId = (
  user: Readonly<AuthUser>,
): string | undefined => {
  if ("creemCustomerId" in user && typeof user.creemCustomerId === "string") {
    return user.creemCustomerId;
  }

  return undefined;
};
