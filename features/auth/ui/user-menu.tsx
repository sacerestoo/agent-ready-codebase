import type { ReactElement } from "react";
import Button from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { toast } from "@/shared/ui/toast";
import { useShared } from "@void/react";
import { handleSignOut } from "../sign-out";
import UserAvatar from "./user-avatar";
import UserProfile from "./user-profile";

const onSignOut = (): void => {
  handleSignOut().catch(function (): void {
    toast.add({
      type: "error",
      title: "Sign out failed",
    });
  });
};

export default function UserMenu(): ReactElement | null {
  const { user } = useShared().auth;
  if (!user) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open user menu"
              className="size-8 rounded-full p-0 shadow-none"
              size="icon"
              type="button"
              variant="outline"
            >
              <UserAvatar image={user.image} />
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="max-w-56 p-1"
        >
          <UserProfile user={user} />
          <DropdownMenuSeparator className="-mx-1 my-1" />
          <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
