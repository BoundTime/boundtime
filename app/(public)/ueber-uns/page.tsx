import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";
import { SITE_NAME } from "@/lib/seo/site-config";

const desc = `Was ist ${SITE_NAME}: Cuckold-Community, Ziele und Zielgruppen – sachlich für neue Nutzer:innen.`;

export const metadata: Metadata = {
  title: "Was ist BoundTime?",
  description: desc,
  alternates: { canonical: "/ueber-uns" },
  openGraph: { title: `Was ist BoundTime? · ${SITE_NAME}`, description: desc },
};

export default function UeberUnsPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader title="Was ist BoundTime?" />

      <PublicArticle>
        <p>
          BoundTime ist eine Cuckold Community von Cuckoldpaaren für die Cuckoldszene. BoundTime verfolgt das Ziel, den
          Austausch innerhalb der Szene zu fördern und Kontakte zwischen den User-/Innen zu ermöglichen.
        </p>
        <h2>BoundTime richtet sich an:</h2>
        <ul>
          <li>Cuckold (-Interessierte)- Paare</li>
          <li>Paare in einer Femdom- Beziehung</li>
          <li>Paare, die in einer Keuschhaltungsbeziehung leben</li>
          <li>Solomänner auf der Suche nach einer Beziehung zu Cuckoldpaaren</li>
          <li>Devote Solomänner auf der Suche nach dominanten Singlefrauen</li>
          <li>Dominante Solodamen auf der Suche nach devoten Singlemännern</li>
        </ul>
        <p>
          Als Plattformbetreiber stellt BoundTime im Rahmen der Aufnahmekriterien sicher, dass Fakeprofile keinen Zutritt
          erhalten und User-/Innen, deren Nutzungsverhalten gegen die Communityziele verstößt, von einer weiteren
          Teilnahme ausgeschlossen werden.
        </p>
      </PublicArticle>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap gap-2">
        {["Nur für Erwachsene (18+)", "Respekt & klare Regeln", "Diskret", "Datenschutz"].map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-full border border-white/[0.1] bg-black/35 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-sm"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-6 py-3.5 text-center text-sm font-semibold text-amber-50 transition-colors hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Kostenlos registrieren
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3.5 text-center text-sm font-medium text-gray-100 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Zurück zur Startseite
        </Link>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-sm">
        <Link
          href="/community-regeln"
          className="font-medium text-amber-200/75 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
        >
          Community-Regeln lesen
        </Link>
      </p>
    </Container>
  );
}
