import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";
import { PublicSectionHeading } from "@/components/public/PublicSectionHeading";
import { SITE_NAME } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Community-Regeln",
  description: `Community-Regeln und respektvoller Umgang auf ${SITE_NAME}.`,
  alternates: { canonical: "/community-regeln" },
  openGraph: { title: `Community-Regeln · ${SITE_NAME}` },
};

export default function CommunityRegelnPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader
        title="Community-Regeln"
        subtitle="Orientierung für respektvolles Miteinander auf BoundTime."
      />

      <div className="mb-10 rounded-2xl border border-amber-200/10 bg-black/35 p-6 ring-1 ring-white/[0.04] backdrop-blur-sm md:p-8">
        <PublicSectionHeading
          align="left"
          eyebrow="Mehr erfahren"
          title="Technik, Ablauf &amp; Begriffe"
          description="Wenn du vor dem Lesen der Regeln einen sachlichen Überblick willst – gleiche Navigation wie auf der Startseite."
          className="max-w-2xl"
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/boundtime-features"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-400/40 bg-amber-950/30 px-5 py-2.5 text-sm font-semibold text-amber-50 transition-colors hover:border-amber-300/50 hover:bg-amber-950/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Funktionen &amp; Ablauf
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-100 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>

      <PublicArticle>
        <p>
          Ziel der Community ist die Vernetzung von Menschen, die in der Welt des Cuckolding leben oder sich dieser
          zugehörig fühlen.
        </p>
        <p>Hierzu gehören:</p>
        <ul>
          <li>Cuckoldpaare</li>
          <li>Lover, Hausfreunde &amp; Bulls</li>
          <li>Femdom-Solodamen</li>
          <li>Devote Solomänner auf der Suche nach einer Femdom oder Hotwife</li>
        </ul>

        <p>
          Vernetzung im Sinne der Community bedeutet Austausch, Verabredungen und Treffen zwischen den Mitgliedern.
        </p>

        <h2>Regeln der Community</h2>
        <p>
          Die Community lebt von einem respektvollen und zuverlässigen Miteinander der Teilnehmer:innen. Cuckolding
          bedeutet insbesondere für Solomänner keine ausschließliche Suche nach schnellem Sex, sondern die Akzeptanz
          einer Lebensform, in welcher der Cuckold und seine Partnerin beidseitig und vollumfänglich einbezogen werden.
        </p>

        <h2>Teilnahme in der Community</h2>
        <p>
          Grundsätzlich steht die Community im Rahmen der Registrierung Jedermann und Jederfrau aus den o.&nbsp;a.
          Zielgruppen offen.
        </p>
        <p>
          Im Rahmen des Registrierungsprozesses behält sich der Betreiber vor, für den dauerhaften Verbleib in der
          Community Teilnahmebegründungen einzufordern.
        </p>

        <p>
          Die Nichteinhaltung der Communityregeln kann zum sofortigen Ausschluss aus der Gemeinschaft führen.
        </p>
      </PublicArticle>
    </Container>
  );
}
