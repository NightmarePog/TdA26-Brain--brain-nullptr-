import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface MenuItem {
  name: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { name: "Podklady", href: "materials" },
  { name: "Kvízy", href: "quizzes" },
  { name: "Feed", href: "feed" },
];

const CourseSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const lastSegment = pathname.split("/").filter(Boolean).pop();

  return (
    <aside className="w-64 flex-none h-screen bg-black border-r border-white/10 flex flex-col">
      {/* Course name */}
      <div className="px-6 py-4">
        <span className="text-sm text-white/70 tracking-wide">Název kurzu</span>
        <div className="mt-2 h-px bg-white/20" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2 px-4 mt-4 flex-1">
        {menuItems.map((item, key) => {
          const isActive = lastSegment === item.href;

          return (
            <Button
              key={key}
              onClick={() => router.push(item.href)}
              variant="ghost"
              className={`
                w-full py-2 text-sm font-medium rounded-xl
                ${isActive ? "bg-white text-black" : "text-white/80 hover:text-white hover:bg-white/20"}
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

export default CourseSidebar;
