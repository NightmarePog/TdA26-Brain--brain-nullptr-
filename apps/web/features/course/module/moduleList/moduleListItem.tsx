import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { FilePdf, MicrosoftPowerpointLogo } from "phosphor-react";
import { ReactNode } from "react";

interface ModuleActionProps {
  children: ReactNode;
}

const ModuleListItem = ({ children }: ModuleActionProps) => {
  return (
    <div
      className="flex justify-between items-center border border-secondary-foreground/30 last:rounded-b-2xl
                    transition-all duration-300 ease-in-out hover:bg-secondary hover:shadow-lg cursor-pointer "
    >
      <div className="flex justify-between w-full mx-5">
        {children}
        <Button className="m-5" variant={"ghost"}>
          <Check />
        </Button>
      </div>
    </div>
  );
};

export default ModuleListItem;
