import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ModuleActionProps {
  children: ReactNode;
}

const ModuleListAction = ({ children }: ModuleActionProps) => {
  return (
    <div className="flex items-center space-x-2  p-5 w-full h-full">
      <p className="text-2xl ">{children}</p>
    </div>
  );
};

export default ModuleListAction;
