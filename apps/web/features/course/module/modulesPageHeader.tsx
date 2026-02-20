import PageTitle from "@/components/typography/pageTitle";
import Text from "@/components/typography/text";
import { BadgeQuestionMark, Check, LockOpen } from "lucide-react";

interface ModulePageHeaderProps {
  courseName: string;
  moduleCount: number;
  courseDescription?: string;
}

const ModulePageHeader = ({
  courseName,
  moduleCount,
  courseDescription,
}: ModulePageHeaderProps) => {
  return (
    <div className="flex justify-between">
      <div>
        <PageTitle>{courseName}</PageTitle>
        <div className="flex gap-2 pt-5 pb-3 text-gray-400">
          <LockOpen />
          <span className="text-xl">otevřeno {moduleCount} modulů</span>
        </div>
        <Text className="text-gray-400">{courseDescription}</Text>
      </div>
      <div className="gap-5">
        <div className="flex">
          <Check /> Hotovo
        </div>
        <div className="flex">
          <BadgeQuestionMark /> neotevřeno
        </div>
      </div>
    </div>
  );
};

export default ModulePageHeader;
