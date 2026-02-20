"use client";

import { Separator } from "@/components/ui/separator";
import ModulesPageHeader from "./modulesPageHeader";
import ModuleCardLayout from "./moduleCardLayout";
import ModuleFeedScreen from "./moduleFeedScreen";
import { SidebarProvider } from "@/components/ui/sidebar";

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
  return (
    <div className="w-full gap-6 p-6">
      {/* Levý panel */}
      <div className="flex-1 space-y-5">
        <ModulesPageHeader
          courseName="Test Name"
          moduleCount={TEST_MODULE_CARDS.length}
          courseDescription="Krátký popis kurzu pro testování layoutu."
        />
        <Separator />
        <ModuleCardLayout cards={TEST_MODULE_CARDS} />
      </div>

      {/* Vertikální separator */}
      <Separator orientation="vertical" />

      {/*<ModuleFeedScreen />*/}
    </div>
  );
};

export default ModuleLayout;
