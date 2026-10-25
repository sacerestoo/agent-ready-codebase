import type { ReactElement } from "react";
import type { AuthUser } from "void";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

type UserAvatarProps = Readonly<{ image: AuthUser["image"] }>;

export default function UserAvatar({ image }: UserAvatarProps): ReactElement {
  return (
    <Avatar size="default">
      {image !== null && image !== undefined && image !== "" && (
        <AvatarImage src={image} />
      )}
      <AvatarFallback className={"outline -outline-offset-1 outline-black/5"} />
    </Avatar>
  );
}
