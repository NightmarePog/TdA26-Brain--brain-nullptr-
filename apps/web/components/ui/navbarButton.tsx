import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavbarButton = ({ children, className, onClick }: Props) => {
  const isMobile = useIsMobile();
  return (
    <button
      type="button"
      className={
        "cursor-pointer p-2 hover:bg-secondary transition-colors duration-200 flex justify-center items-center gap-4 font-bold " +
        className +
        (!isMobile ? " px-4" : "px-2")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default NavbarButton;
