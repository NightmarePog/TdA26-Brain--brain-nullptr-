"use client";

import CourseSidebar from "@/components/layouts/courseSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <CourseSidebar />
      {children}
    </SidebarProvider>
  );
};

export default DashboardPage;
