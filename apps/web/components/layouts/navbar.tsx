"use client";

import { Book, User } from "lucide-react";
import { useRouter } from "next/navigation";

import Icon from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import NavbarButton from "../ui/navbarButton";
import SettingsPopover from "./settingsPopover";

export default function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <nav className="flex h-16 md:h-20 items-center justify-between bg-primary text-white px-4 md:px-8 z-50">
      {/* Left: logo */}
      <div className="flex items-center gap-2 md:gap-4">
        <NavbarButton onClick={() => router.push("/")}>
          <Icon src={Logo} alt="logo" className="w-8 h-8 md:w-12 md:h-12" />
        </NavbarButton>

        <NavbarButton
          className="flex items-center gap-2 text-lg"
          onClick={() => router.push("/courses")}
        >
          <Book className="w-6 h-6" />
          Kurzy
        </NavbarButton>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <NavbarButton
          className="flex items-center gap-2"
          onClick={() => router.push("/login")}
        >
          <User className="w-6 h-6" />
          {!isMobile && <span className="text-lg">Přihlásit</span>}
        </NavbarButton>

        <SettingsPopover />
      </div>
    </nav>
  );
}
