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
      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-24 lg:px-32"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Nauč se dovednosti, které skutečně využiješ.
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-medium mb-8 opacity-95">
              Think Different Academy ti pomůže pochopit látku rychleji,
              procvičit ji na reálných úkolech a opravdu ji umět — nejen se ji
              naučit nazpaměť.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStartClick}
                className="px-8 py-4 text-lg font-bold"
              >
                Začít
              </Button>
            </div>
          </div>

          <div className="w-48 h-48 md:w-64 md:h-64">
            <Icon
              src={Logo}
              size="huge"
              alt="Think Different Academy Logo"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* PROBLÉM */}
      <section className="py-24 px-6 sm:px-12 md:px-24 lg:px-32 bg-[var(--background)]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[var(--foreground)]">
          Proč jsme lepší jak ostatní?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>Nadčasovost</Badge>
              <h3 className="text-xl font-semibold">Systém kvízů</h3>
              <p>
                Náš tým vytvořil ty nejlepší systémy kvízů které ti dají co
                nejlepší zpětnou vazbu
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>Velikost</Badge>
              <h3 className="text-xl font-semibold">Mnoho materiálů</h3>
              <p>Platforma nabízí desítky materiálů.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>rychlost</Badge>
              <h3 className="text-xl font-semibold">rychlý pokrok</h3>
              <p>Učení je snadné a rychlé u nás!</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ŘEŠENÍ */}
      <section className="py-24 px-6 sm:px-12 md:px-24 lg:px-32 bg-muted">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Think Different Academy to dělá jinak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>Interaktivní</Badge>
              <h3 className="text-xl font-semibold">Učíš se praxí</h3>
              <p>
                Každá lekce obsahuje úkoly, které tě nutí přemýšlet a tvořit.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>Okamžitá zpětná vazba</Badge>
              <h3 className="text-xl font-semibold">
                Hned víš, kde se zlepšit
              </h3>
              <p>Aplikace ti ukáže chyby a vysvětlí správné řešení.</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-8 text-center space-y-4">
              <Badge>Flexibilita</Badge>
              <h3 className="text-xl font-semibold">Učíš se vlastním tempem</h3>
              <p>Studuj kdykoliv a odkudkoliv — bez tlaku.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DŮVĚRA */}
      <section className="py-24 px-6 sm:px-12 md:px-24 lg:px-32 text-center bg-[var(--background)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          Důvěřují nám tisíce studentů
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <p className="text-4xl font-bold text-primary">5 000+</p>
            <p>Aktivních studentů</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">120+</p>
            <p>Hodin výukového obsahu</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">4.8 / 5</p>
            <p>Průměrné hodnocení</p>
          </div>
        </div>

        <blockquote className="max-w-2xl mx-auto text-lg italic">
          „Díky Think Different Academy jsem konečně pochopil látku, která mi ve
          škole nedávala smysl.“
        </blockquote>
        <p className="mt-4 font-semibold">– Martin, student VŠ</p>
      </section>

      {/* FINÁLNÍ CTA */}
      <section
        className="py-24 px-6 sm:px-12 md:px-24 lg:px-32 text-center"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--primary-foreground)]">
          Začni se zlepšovat ještě dnes.
        </h2>

        <p className="text-lg mb-8 text-[var(--primary-foreground)]">
          První lekce je zdarma. Bez závazků.
        </p>

        <Button
          onClick={handleStartClick}
          className="px-8 py-4 text-lg font-bold"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
        >
          Začít první lekci
        </Button>
      </section>
    </div>
  );
}
