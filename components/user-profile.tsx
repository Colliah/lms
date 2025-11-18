import { ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { type Session, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type UserProfileProps = {
  session: Session;
};

export function UserProfile({ session }: UserProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Avatar className="size-6">
            <AvatarImage src="https://avatar.iran.liara.run/public/1" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{session?.user?.name}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut({
              fetchOptions: {
                onSuccess: () => {
                  toast.success("Sign out successfully!");
                },
              },
            });
          }}
        >
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
