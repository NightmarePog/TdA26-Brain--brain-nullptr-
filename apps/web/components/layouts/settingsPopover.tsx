import { Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ModeToggle } from "./themeToggle";

const SettingsPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="m-1">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Nastavení</h4>
            <ModeToggle />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsPopover;
