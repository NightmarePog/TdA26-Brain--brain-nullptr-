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
    <nav className="sticky flex justify-between bg-secondary-foreground text-white">
      <div className="flex gap-2 text-inherit">
        <NavbarButton
          className="p-x-5"
          onClick={() => {
            router.push("/");
          }}
        >
          <Icon src={Logo} alt={"logo"} />
        </NavbarButton>
        {!isMobile && <div className="px-10"></div>}
        <NavbarButton
          onClick={() => {
            router.push("/courses");
          }}
        >
          <Book stroke="white" />
          Kurzy
        </NavbarButton>
      </div>
      <div className="gap-2 flex text-inherit">
        <NavbarButton onClick={() => router.push("/login")}>
          <User />
          {!isMobile && "Přihlásit"}
        </NavbarButton>
        <SettingsPopover />
      </div>
    </nav>
  );
}
