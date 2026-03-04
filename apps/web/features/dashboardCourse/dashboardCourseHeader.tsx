import PageTitle from "@/components/typography/pageTitle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench } from "lucide-react";
import DashboardCourseSettingsWindow from "./dashboardCourseSettingsWindow";

interface DashboardCourseHeaderProps {
  courseName: string;
}

const DashboardCourseHeader = ({ courseName }: DashboardCourseHeaderProps) => {
  return (
    <div className="flex gap-5">
      <PageTitle>Editace kurzu - {courseName}</PageTitle>
      <DashboardCourseSettingsWindow />
    </div>
  );
};

export default DashboardCourseHeader;
