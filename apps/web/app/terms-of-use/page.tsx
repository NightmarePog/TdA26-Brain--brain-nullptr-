"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Podmínky použití
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Tyto podmínky upravují používání této webové aplikace. Používáním
            služby souhlasíte s níže uvedenými pravidly.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>1. Úvodní ustanovení</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Provozovatel poskytuje tuto aplikaci za účelem prezentace služeb
              nebo poskytování digitálních funkcí. Tyto podmínky představují
              právně závaznou dohodu mezi vámi a provozovatelem.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Používání služby</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Zavazujete se používat službu v souladu s platnými právními
              předpisy a nezasahovat do její bezpečnosti nebo funkčnosti.
              Nesmíte zneužívat technické chyby ani se pokoušet o neoprávněný
              přístup k systému.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Uživatelský obsah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Pokud aplikace umožňuje vkládání obsahu, nesete odpovědnost za
              jeho zákonnost a pravdivost. Provozovatel si vyhrazuje právo
              odstranit obsah, který porušuje právní předpisy nebo tyto
              podmínky.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Omezení odpovědnosti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Služba je poskytována &quot;tak jak je&quot;. Provozovatel nenese
              odpovědnost za přerušení provozu, ztrátu dat nebo škody vzniklé
              používáním aplikace, pokud právní předpisy nestanoví jinak.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Duševní vlastnictví</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Veškerý obsah aplikace, včetně textů, grafiky a softwaru, je
              chráněn autorským právem nebo jinými právy duševního vlastnictví.
              Bez předchozího souhlasu není dovoleno obsah kopírovat ani šířit.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Změny podmínek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Provozovatel si vyhrazuje právo tyto podmínky kdykoli upravit.
              Aktualizované znění bude zveřejněno na této stránce.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Tyto podmínky jsou účinné od {new Date().getFullYear()}.
        </p>
      </div>
    </main>
  );
}
