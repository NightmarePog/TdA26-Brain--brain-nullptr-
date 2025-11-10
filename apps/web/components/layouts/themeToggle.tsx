"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Počkáme, než se komponenta namountuje, aby nebyl problém při SSR
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // true pokud je aktuální motiv dark
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button onClick={handleToggle} className="justify-start">
      {isDark ? (
        <>
          <Moon /> Přepnout na světlý
        </>
      ) : (
        <>
          <Sun /> Přepnout na tmavý
        </>
      )}
    </Button>
  );
}
