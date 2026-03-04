import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface DashboardCourseTabsProps {
  children: ReactNode;
}

const DashboardCourseTabs = ({ children }: DashboardCourseTabsProps) => {
  return (
    <Tabs defaultValue="settings" className="pt-10">
      <TabsList>
        <TabsTrigger value="settings">Nastavení</TabsTrigger>
        <TabsTrigger value="graphs">grafy</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default DashboardCourseTabs;
