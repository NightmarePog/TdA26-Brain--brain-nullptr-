"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function GdprPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Ochrana osobních údajů (GDPR)
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Tato stránka vysvětluje, jakým způsobem zpracováváme, uchováváme a
            chráníme vaše osobní údaje v souladu s nařízením GDPR.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Kdo je správcem údajů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Správcem osobních údajů je provozovatel této webové aplikace. Pro
              účely komunikace nás můžete kontaktovat prostřednictvím uvedeného
              kontaktního formuláře nebo e-mailu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jaké údaje zpracováváme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Můžeme zpracovávat identifikační a kontaktní údaje (např. jméno,
              e-mail), technické údaje (IP adresa, cookies) a další údaje, které
              nám sami dobrovolně poskytnete.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Účel zpracování</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Údaje zpracováváme za účelem poskytování služeb, zlepšování
              aplikace, plnění právních povinností a případně marketingové
              komunikace (pokud jste k tomu udělili souhlas).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doba uchování údajů</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Osobní údaje uchováváme pouze po dobu nezbytně nutnou pro naplnění
              výše uvedených účelů nebo po dobu stanovenou právními předpisy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vaše práva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Máte právo na přístup ke svým údajům, jejich opravu nebo výmaz,
              omezení zpracování, přenositelnost údajů a právo podat stížnost u
              dozorového úřadu.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Tento dokument je platný od {new Date().getFullYear()} a může být
          průběžně aktualizován.
        </p>
      </div>
    </main>
  );
}
