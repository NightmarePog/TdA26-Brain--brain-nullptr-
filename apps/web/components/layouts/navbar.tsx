"use client";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import Thinking from "@/public/Icons/vector/Thinking/zarivka_thinking_bile.svg"
import Icon from "@/components/ui/icon";
import { Settings, User } from "lucide-react";
import NavbarButton from "../ui/navbarButton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const isMobile = useIsMobile()
  return (

  <nav className="flex justify-between bg-primary">
    <div className="flex gap-2">
      <NavbarButton className="p-5"><Icon src={Logo} alt={"logo"} /></NavbarButton>
      {!isMobile && <div className="px-5"></div>}
      <NavbarButton>Kurzy<Icon size="smallest" src={Thinking} alt="ThinkingIcon"/></NavbarButton>
    </div>
    <div className="gap-2 flex">
      <NavbarButton>{!isMobile && "Přihlásit"}<User/></NavbarButton>
      <NavbarButton><Settings/></NavbarButton>
    </div>
  </nav>
  );
}
