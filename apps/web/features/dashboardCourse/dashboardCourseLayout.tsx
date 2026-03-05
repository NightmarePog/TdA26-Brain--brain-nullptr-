import { Separator } from "@/components/ui/separator";
import DashboardCourseHeader from "./dashboardCourseHeader";
import DashboardCourseTabs from "./dashboardCourseTabs";
import DashboardSettingsLayout from "./settings/DashboardSettingsLayout";
import { TabsContent } from "@/components/ui/tabs";

const DashboardCourseLayout = () => {
  return (
    <div className="p-10">
      <DashboardCourseHeader courseName="a test name" />
      <DashboardCourseTabs>
        <Separator />
        <TabsContent value="settings">
          <DashboardSettingsLayout />
        </TabsContent>
      </DashboardCourseTabs>
    </div>
  );
};

export default DashboardCourseLayout;
