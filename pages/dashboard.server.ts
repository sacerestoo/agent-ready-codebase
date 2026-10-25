import { defineHandler, type InferProps } from "void";
import { getUser, type AuthUser } from "void/auth";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler((c): { user: AuthUser } | Response => {
  const user = getUser();
  if (!user) return c.redirect("/");
  return { user };
});
