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
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () => userApi.check(),
    refetchOnMount: true,
  });

  const userRoute = data ? "/dashboard" : "/login";

  const userLabel = data ? "Dashboard" : "Přihlásit";

  return (
    <nav className="flex h-16 md:h-20 items-center justify-between bg-primary text-white px-4 md:px-8 z-50">
      {/* Left: logo */}
      <div className="flex items-center gap-2 md:gap-4 ">
        <NavbarButton onClick={() => router.push("/")} className="h-18">
          <Icon src={Logo} alt="logo" className="w-8 h-8 md:w-12 md:h-12" />
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
