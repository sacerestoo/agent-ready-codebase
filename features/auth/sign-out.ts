import { authClient } from "../../auth-client";

export const handleSignOut = async (): Promise<void> => {
  await authClient.signOut();
  window.location.reload();
};
