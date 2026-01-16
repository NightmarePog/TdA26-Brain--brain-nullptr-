"use client";

import CourseSidebar from "@/components/layouts/courseSidebar";
import DashboardSidebar from "@/components/layouts/dashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import useCourseAddress from "@/hooks/useCourseAddress";

const DashboardPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      {children}
    </SidebarProvider>
  );
};

export default DashboardPage;
