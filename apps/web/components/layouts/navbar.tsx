"use client";
import { Book, User } from "lucide-react";
import Icon from "@/components/ui/icon";

import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import NavbarButton from "../ui/navbarButton";
import { useRouter } from "next/navigation";
import SettingsPopover from "./settingsPopover";

export default function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <nav className="flex justify-between items-center bg-black text-white z-50 h-18 px-8 md:px-16">
      <div className="flex gap-4 items-center text-inherit">
        <NavbarButton className="px-6 py-4" onClick={() => router.push("/")}>
          <Icon src={Logo} alt={"logo"} className="w-8 h-8 md:w-12 md:h-12" />
        </NavbarButton>

        {!isMobile && <div className="px-10"></div>}

        <NavbarButton
          className="px-6 py-4 text-lg md:text-xl"
          onClick={() => router.push("/courses")}
        >
          <Book stroke="white" className="w-8 h-8 md:w-12 md:h-12 mr-2" />
          Kurzy
        </NavbarButton>
      </div>

      <div className="gap-4 flex items-center text-inherit">
        <NavbarButton
          className="px-6  text-lg md:text-xl"
          onClick={() => router.push("/login")}
        >
          <User />
          {!isMobile && "Přihlásit"}
        </NavbarButton>

        <SettingsPopover />
      </div>
    </nav>
  );
}
