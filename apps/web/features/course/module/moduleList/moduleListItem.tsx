import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { FilePdf, MicrosoftPowerpointLogo } from "phosphor-react";
import { ReactNode } from "react";

export type FileType = "pdf" | "word";

export type StringToIconMap = Record<FileType, ReactNode>;

export const stringToIcon: StringToIconMap = {
  pdf: <FilePdf className="text-2xl text-red-600" />,
  word: <MicrosoftPowerpointLogo className="text-2xl" />,
};
interface ModuleActionProps {
  children: ReactNode;
  type: FileType;
  onAction?: () => void;
}

const ModuleListItem = ({ children, type, onAction }: ModuleActionProps) => {
  return (
    <div
      className="flex justify-between items-center  bg-foreground/10 border border-secondary-foreground last:rounded-b-2xl
                    transition-all duration-300 ease-in-out hover:bg-foreground-20 hover:shadow-lg cursor-pointer hover:bg-secondary-foreground/10"
    >
      <div className="flex justify-between w-full mx-5">
        <div
          className="flex items-center w-full h-full"
          onClick={() => onAction?.()}
        >
          {stringToIcon[type]}
          <div className="ml-2">{children}</div>
        </div>
        <Button className="m-5" variant={"ghost"}>
          <Check />
        </Button>
      </div>
    </div>
  );
};

export default ModuleListItem;
