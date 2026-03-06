import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import FeedMessage from "./FeedMessage";
import { useQuery } from "@tanstack/react-query";
import { FeedItem } from "@/types/api/feed";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";

interface ModuleNotificationDropdownProps {
  notificationCount: number;
}

const ModuleNotificationDropdown = ({
  notificationCount,
}: ModuleNotificationDropdownProps) => {
  const { courseUuid } = useCourseAddress();

  const { data, isLoading, isError, error } = useQuery<FeedItem[]>({
    queryKey: ["feed", courseUuid],
    queryFn: async () => {
      const result = await CoursesApi.feed.getAll(courseUuid);
      return result;
    },
    enabled: !!courseUuid,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={notificationCount ? "default" : "ghost"}>
          <Bell />
          {notificationCount !== 0 && (
            <span className="ml-1">{notificationCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        {isLoading && <div className="p-2">Načítání notifikací...</div>}
        {isError && (
          <div className="p-2 text-red-500">
            Chyba při načítání notifikací: {error?.message ?? "Neznámá chyba"}
          </div>
        )}
        {!isLoading && !isError && data && data.length === 0 && (
          <div className="p-2 text-gray-500">Žádné nové notifikace</div>
        )}

        {!isLoading &&
          !isError &&
          data &&
          data.map((feedItem) => (
            <FeedMessage
              key={feedItem.uuid}
              author={feedItem.type ?? "system"}
              message={feedItem.message ?? ""}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModuleNotificationDropdown;
