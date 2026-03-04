import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { FilePdf, MicrosoftPowerpointLogo } from "phosphor-react";
import { ReactNode } from "react";

interface ModuleActionProps {
  children: ReactNode;
  className?: string;
}

const ModuleListItem = ({ children, className }: ModuleActionProps) => {
  return (
    <div
      className={
        "flex justify-between items-center border border-secondary-foreground/30 last:rounded-b-2xl transition-all duration-300 ease-in-out hover:bg-secondary hover:shadow-lg cursor-pointer " +
        className
      }
    >
      <div className={"flex justify-between items-center w-full mx-5 "}>
        {children}
      </div>
    </div>
  );
};

export default ModuleListItem;
