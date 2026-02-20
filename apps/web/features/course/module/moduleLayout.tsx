"use client";

import { Separator } from "@/components/ui/separator";
import ModulesPageHeader from "./modulesPageHeader";
import ModuleCardLayout from "./moduleCardLayout";
import ModuleFeedScreen from "./moduleFeedScreen";
import { SidebarProvider } from "@/components/ui/sidebar";
import useSidebar from "@/features/sidebar/useSidebar";
import { useEffect } from "react";

export const TEST_MODULE_CARDS = [
  {
    name: "React Foundations",
    description: "Základy komponent, props a state.",
  },
  {
    name: "TypeScript Deep Dive",
    description: "Typy, generika a bezpečnější frontend.",
  },
  {
    name: "Next.js Architecture",
    description: "Routing, server components a optimalizace.",
  },
  {
    name: "Animations with Framer Motion",
    description: "Plynulé přechody a layout animace.",
  },
  {
    name: "UI Design Systems",
    description: "Komponentová konzistence a škálovatelnost.",
  },
];

const ModuleLayout = () => {
  const { open } = useSidebar();
  useEffect(() => open(), [open]);
  return (
    <div className="w-full gap-6 p-6">
      {/* Levý panel */}
      <div className="flex-1 space-y-5">
        <ModulesPageHeader
          courseName="Test Name"
          moduleCount={TEST_MODULE_CARDS.length}
          courseDescription="Krátký popis kurzu pro testování layoutu. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean vel  massa quis mauris vehicula lacinia. Maecenas aliquet accumsan leo. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut  labore et dolore magnam aliquam quaerat voluptatem. Curabitur ligula  sapien, pulvinar a vestibulum quis, facilisis vel sapien. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil  molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas  nulla pariatur? Nullam eget nisl. Etiam dictum tincidunt diam. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu  fugiat nulla pariatur. Fusce tellus. Etiam bibendum elit eget erat.  Nulla est. Fusce suscipit libero eget elit. In convallis. Nunc tincidunt ante vitae massa."
          doneModules={5}
          unfinishedModules={10}
          notificationCount={0}
        />
        <Separator />
        <ModuleCardLayout cards={TEST_MODULE_CARDS} />
      </div>
    </div>
  );
};

export default ModuleLayout;
