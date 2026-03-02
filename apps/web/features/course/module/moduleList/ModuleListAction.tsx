import { Button } from "@/components/ui/button";
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

const ModuleListAction = ({ children, onAction, type }: ModuleActionProps) => {
  return (
    <div
      className="flex items-center w-full h-full"
      onClick={() => onAction?.()}
    >
      {stringToIcon[type]}
      <div className="ml-2">
        <div className=" items-center space-x-2  p-5 w-full h-full">
          <p className="text-2xl ">{children}</p>
        </div>
      </div>
    </div>
  );
};

export default ModuleListAction;
