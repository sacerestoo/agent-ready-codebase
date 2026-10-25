import { defineMiddleware } from "void";
import { getUser, type AuthUser } from "void/auth";

declare module "void" {
  interface CloudContextVariables {
    shared: { auth: { user: AuthUser | null } };
  }
}

export default defineMiddleware(async (c, next): Promise<Response | void> => {
  const user = getUser();
  c.set("shared", { auth: { user } });

  if (
    !user &&
    (c.req.path === "/dashboard" || c.req.path.startsWith("/dashboard/"))
  ) {
    return c.redirect("/sign-in");
  }

  if (user && c.req.path === "/sign-in") {
    return c.redirect("/");
  }

  await next();
  return undefined;
});
