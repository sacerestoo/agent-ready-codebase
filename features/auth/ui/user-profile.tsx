import type { ReactElement } from "react";
import type { AuthUser } from "void";
import UserAvatar from "./user-avatar";

type UserProfileProps = Readonly<{ user: AuthUser }>;

export default function UserProfile({ user }: UserProfileProps): ReactElement {
  return (
    <div className="flex min-w-0 items-center gap-2 px-1 py-2">
      <UserAvatar image={user.image} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">
          {user.name.trim().length > 0 ? user.name : "Person"}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
