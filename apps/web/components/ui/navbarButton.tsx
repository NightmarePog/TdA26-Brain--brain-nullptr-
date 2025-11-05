import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string
}

const NavbarButton = ({ children, className }: Props) => {
  const isMobile = useIsMobile()
  return (
    <button  className={"cursor-pointer p-4 hover:bg-secondary transition-colors duration-200 flex justify-center items-center gap-4 font-bold "+className+(!isMobile ? " px-4" : "px-2" )}>
      {children}
    </button>
  );
};

export default NavbarButton;
