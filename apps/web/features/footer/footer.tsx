"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              Think Diffrent Academy
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aplikace co přináší do učení zábavu a výzvu k vývoji výsledků.
              Připoj se ještě dnes!
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Navigace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-foreground"
                >
                  Domů
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="transition-colors hover:text-white"
                >
                  Kurzy
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Právní</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="terms-of-use"
                  className="transition-colors hover:text-foreground"
                >
                  Podmínky použití
                </Link>
              </li>
              <li>
                <Link
                  href="gdpr"
                  className="transition-colors hover:text-foreground"
                >
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Informace</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="terms-of-use"
                className="transition-colors hover:text-foreground"
              >
                O nás
              </Link>
            </li>
            <li>
              <Link
                href="gdpr"
                className="transition-colors hover:text-foreground"
              >
                Kontakty
              </Link>
            </li>
          </ul>
        </div>
      </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} Think Diffrent Academy. Všechna práva
            vyhrazena.
          </p>
          <p>vytvořeno díky Brain *brain = nullptr; </p>
        </div>
      </div>
    </footer>
  );
}
