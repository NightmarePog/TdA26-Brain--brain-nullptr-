import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownContext } from "flowbite-react";
import { Bell } from "lucide-react";
import FeedMessage from "./FeedMessage";

interface ModuleNotificationDropdownProps {
  notificationCount: number;
}

const ModuleNotificationDropdown = ({
  notificationCount,
}: ModuleNotificationDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={(notificationCount && "default") || "ghost"}>
          <Bell />
          {notificationCount !== 0 && notificationCount}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <FeedMessage author="system" message="test" />
        <FeedMessage
          author="aktualizace"
          message="toto bylo aktualizováno
      "
        />
        <FeedMessage author="system" message="test" />
        <FeedMessage author="system" message="test" />
        <FeedMessage author="system" message="test" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ModuleNotificationDropdown;
