"use client";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import Icon from "@/components/ui/icon";

import { Book, HomeIcon, Settings, User } from "lucide-react";
import NavbarButton from "../ui/navbarButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "./themeToggle";

export default function Navbar() {
  const isMobile = useIsMobile();
  return (
    <nav className="sticky flex justify-between bg-primary text-white">
      <div className="flex gap-2 text-inherit">
        <NavbarButton className="p-x-5">
          <Icon src={Logo} alt={"logo"} />
        </NavbarButton>
        {!isMobile && <div className="px-10"></div>}
        <NavbarButton>
          <HomeIcon stroke="white" />
          {!isMobile && "Domů"}
        </NavbarButton>
        <NavbarButton>
          <Book stroke="white" />
          Kurzy
        </NavbarButton>
      </div>
      <div className="gap-2 flex text-inherit">
        <NavbarButton>
          <User stroke="white" />
          {!isMobile && "Přihlásit"}
        </NavbarButton>
        <NavbarButton>
          <Settings stroke="white" />
        </NavbarButton>
        <ModeToggle />
      </div>
    </nav>
  );
}
