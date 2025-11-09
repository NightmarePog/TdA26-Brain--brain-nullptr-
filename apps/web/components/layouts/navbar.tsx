"use client";
import { Book, HomeIcon, Settings, User } from "lucide-react";
import Icon from "@/components/ui/icon";

import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/public/Logos/SVG/Think-different-Academy_LOGO_bily.svg";
import NavbarButton from "../ui/navbarButton";
import { ModeToggle } from "./themeToggle";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <nav className="sticky flex justify-between bg-primary text-white">
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
            router.push("/home");
          }}
        >
          <HomeIcon stroke="white" />
          {!isMobile && "Domů"}
        </NavbarButton>
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
        <NavbarButton>
          <User
            stroke="white"
            onAbort={() => {
              router.push("/login");
            }}
          />
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
