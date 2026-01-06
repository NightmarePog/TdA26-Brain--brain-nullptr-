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
    <nav
      className={`flex ${
        isMobile
          ? "flex-col items-start h-full w-20"
          : "flex-row justify-between h-18 px-8 md:px-16"
      } bg-primary text-white z-50`}
    >
      {/* Levá část / logo a odkazy */}
      <div
        className={`flex ${
          isMobile ? "flex-col gap-6 w-full" : "flex-row gap-4 items-center"
        }`}
      >
        <NavbarButton
          className={`px-4 py-4 ${isMobile ? "w-full flex justify-center" : ""}`}
          onClick={() => router.push("/")}
        >
          <Icon src={Logo} alt={"logo"} className="w-8 h-8 md:w-12 md:h-12" />
        </NavbarButton>

        <NavbarButton
          className={`px-4 py-4 flex items-center gap-2 text-lg md:text-xl ${
            isMobile ? "justify-center w-full" : ""
          }`}
          onClick={() => router.push("/courses")}
        >
          <Book stroke="white" className="w-6 h-6 md:w-8 md:h-8" />
          {!isMobile && "Kurzy"}
        </NavbarButton>
      </div>

      {/* Pravá část / přihlášení a nastavení */}
      <div
        className={`flex ${
          isMobile
            ? "flex-col gap-6 mt-auto w-full items-center"
            : "flex-row gap-4 items-center"
        }`}
      >
        <NavbarButton
          className={`px-4 py-4 flex items-center gap-2 text-lg md:text-xl ${
            isMobile ? "justify-center w-full" : ""
          }`}
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
