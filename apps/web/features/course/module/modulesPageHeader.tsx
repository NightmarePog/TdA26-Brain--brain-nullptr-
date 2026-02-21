import PageTitle from "@/components/typography/pageTitle";
import Text from "@/components/typography/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InfoLabel from "@/components/ui/infoLabel";
import { Bell, Check, Component, OctagonAlert } from "lucide-react";
import ModuleNotificationDropdown from "./moduleNotificationDropdown";

interface ModulePageHeaderProps {
  courseName: string;
  moduleCount: number;
  courseDescription?: string;
  doneModules: number;
  unfinishedModules: number;
  notificationCount: number;
}

const ModulePageHeader = ({
  courseName,
  moduleCount,
  courseDescription,
  doneModules,
  unfinishedModules,
  notificationCount,
}: ModulePageHeaderProps) => {
  return (
    <div className="p-5">
      <PageTitle>{courseName}</PageTitle>
      <div className="flex justify-between">
        <div className="lg:flex gap-5 ">
          <InfoLabel>
            <Component /> Otevřeno {moduleCount} modulů
          </InfoLabel>
          <InfoLabel>
            <Check /> Hotovo <Badge>{doneModules}</Badge>
          </InfoLabel>
          <InfoLabel>
            <OctagonAlert /> Nedkončeno <Badge>{unfinishedModules}</Badge>
          </InfoLabel>
        </div>
        <ModuleNotificationDropdown notificationCount={notificationCount} />
      </div>
      <div>
        <Text className="text-foreground/80 max-w-200">
          {courseDescription}
        </Text>
      </div>
    </div>
  );
};

export default ModulePageHeader;
