import { creemClient } from "@creem_io/better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "void/client";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [creemClient({ persistSubscriptions: true }), emailOTPClient()],
});
