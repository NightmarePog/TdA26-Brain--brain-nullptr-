import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavbarButton = ({ children, className, onClick }: Props) => {
  const isMobile = useIsMobile();
  return (
    <Button
      type="button"
      variant={"ghost"}
      size={"lg"}
      className={
        "cursor-pointer p-4 m-1   transition-colors duration-200 gap-4 font-bold " +
        className +
        (!isMobile ? " px-4" : "px-2")
      }
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default NavbarButton;
