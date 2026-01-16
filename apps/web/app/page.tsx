"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Logo from "@/public/Icons/vector/Idea/zarivka_idea_bile.svg";

export default function Home() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push("/courses");
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section
        className="relative h-screen flex flex-col justify-center items-start px-5 sm:px-10 md:px-20 lg:px-32"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center w-full justify-between">
          {/* Text */}
          <div className="flex-1 mb-10 md:mb-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white drop-shadow-lg mb-6">
              Odemkni svůj{" "}
              <span className="text-[var(--primary-foreground)]">
                vzdělávací potenciál
              </span>
              !
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-8 text-white drop-shadow-md">
              Když se zábava spojí se vzděláním. Připoj se k nám a objev stovky
              interaktivních kurzů, které tě budou opravdu bavit.
            </p>
            <Button
              onClick={handleStartClick}
              className="px-6 sm:px-10 py-3 sm:py-5 text-lg sm:text-2xl font-bold transition"
            >
              Začít teď
            </Button>
          </div>

          {/* Icon/Logo */}
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 flex-shrink-0">
            <Icon
              src={Logo}
              size="huge"
              alt="Think Academy Logo"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-5 sm:px-10 md:px-20 lg:px-32 bg-[var(--background)]">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[var(--foreground)]">
          Proč si vybrat Think Academy?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="hover:scale-105 transition-transform shadow-lg">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <Badge
                variant="secondary"
                className="bg-[var(--secondary)] text-[var(--secondary-foreground)]"
              >
                Interaktivní
              </Badge>
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
                Praktické kurzy
              </h3>
              <p className="text-sm sm:text-lg text-[var(--foreground)]">
                Nauč se dovednosti, které můžeš hned využít.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:scale-105 transition-transform shadow-lg">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <Badge
                variant="secondary"
                className="bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                Zábava
              </Badge>
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
                Učení hrou
              </h3>
              <p className="text-sm sm:text-lg text-[var(--foreground)]">
                Interaktivní a zábavné lekce tě udrží motivovaného.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:scale-105 transition-transform shadow-lg">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <Badge
                variant="secondary"
                className="bg-[var(--primary)] text-[var(--primary-foreground)]"
              >
                Flexibilita
              </Badge>
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
                Kdykoliv a kdekoliv
              </h3>
              <p className="text-sm sm:text-lg text-[var(--foreground)]">
                Přizpůsob si tempo učení vlastním potřebám.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 sm:py-32 px-5 sm:px-10 md:px-20 lg:px-32 text-center"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[var(--primary-foreground)]">
          Připoj se ještě dnes!
        </h2>
        <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-10 text-[var(--primary-foreground)]">
          Začni svou cestu za vzděláním s Think Academy. Už žádné nudné hodiny.
        </p>
        <Button
          onClick={handleStartClick}
          className="px-6 sm:px-10 py-3 sm:py-5 text-lg sm:text-2xl font-bold transition"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
        >
          Začít teď
        </Button>
      </section>
    </div>
  );
}
