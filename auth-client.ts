import { creemClient } from "@creem_io/better-auth/client";
import { createCreemAuthClient } from "@creem_io/better-auth/create-creem-auth-client";

// Void's conditional auth config does not expose plugin endpoint types to the client.
// eslint-disable-next-line typescript/no-deprecated
export const authClient = createCreemAuthClient({
  basePath: "/api/auth",
  plugins: [creemClient({ persistSubscriptions: true })],
});
