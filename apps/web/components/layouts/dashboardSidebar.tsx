import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import useCourseAddress from "@/hooks/useCourseAddress";
import { useQuery } from "@tanstack/react-query";
import { CoursesApi } from "@/lib/api";

interface MenuItem {
  name: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { name: "Podklady", href: "materials" },
  { name: "Kvízy", href: "quizzes" },
  { name: "Feed", href: "feed" },
  { name: "odpovědi uživatelů", href: "user-results" },
];

const DashboardSidebar = () => {
  const router = useRouter();
  const { courseUuid, addressingTo, addressingToUuid } = useCourseAddress();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["quizzes", addressingToUuid],
    queryFn: () => CoursesApi.get(courseUuid),
    enabled: Boolean(courseUuid),
  });

  if (isError) {
    return <p className="p-4 text-red-500">{error.message}</p>;
  }

  return (
    <aside className="w-64 flex-none h-screen bg-sidebar border-r border-white/10 flex flex-col sticky top-0">
      {/* Course name */}
      <div className="px-6 py-4">
        <span className="text-sm text-white/70 tracking-wide">
          {isLoading ? "loading..." : data?.name}
        </span>
        <div className="mt-2 h-px bg-white/20" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 px-4 mt-4 flex-1">
        {menuItems.map((item) => {
          const isActive = addressingTo === item.href;

          return (
            <Button
              key={item.href}
              onClick={() =>
                router.push(`/dashboard/${courseUuid}/${item.href}`)
              }
              variant="ghost"
              className={`
                w-full py-2 text-sm font-medium rounded-xl
                ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/80 hover:text-white hover:bg-white/20"
                }
              `}
            >
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Bottom line */}
      <div className="px-4 pb-4">
        <div className="h-px bg-white/20" />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
