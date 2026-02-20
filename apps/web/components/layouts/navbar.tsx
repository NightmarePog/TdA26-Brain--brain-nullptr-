"use client";

import { Book, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import Icon from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import NavbarButton from "../ui/navbarButton";
import SettingsPopover from "./settingsPopover";
import { userApi } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const hasToken = useMemo(() => userApi.check(), []);

  const userRoute = hasToken ? "/dashboard" : "/login";
  const userLabel = hasToken ? "Dashboard" : "Přihlásit";

  return (
    <nav className="flex h-16 md:h-20 w-full items-center justify-between bg-primary px-4 md:px-8 text-white">
      {/* Left */}
      <div className="flex items-center gap-2 md:gap-4">
        <NavbarButton onClick={() => router.push("/")}>
          <Icon src={Logo} alt="logo" className="h-8 w-8 md:h-12 md:w-12" />
        </NavbarButton>

        <NavbarButton
          className="flex items-center gap-2 text-lg"
          onClick={() => router.push("/courses")}
        >
          <Book className="h-6 w-6" />
          Kurzy
        </NavbarButton>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">
        <NavbarButton
          className="flex items-center gap-2"
          onClick={() => router.push(userRoute)}
        >
          <User className="h-6 w-6" />
          {!isMobile && <span className="text-lg">{userLabel}</span>}
        </NavbarButton>

        <SettingsPopover />
      </div>
    </nav>
  );
}
