import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";
import { SITE_NAME } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Community & Regeln",
  description: `Community, Zielgruppen und Regeln auf ${SITE_NAME} – respektvolles Miteinander.`,
  alternates: { canonical: "/community-regeln" },
  openGraph: { title: `Community & Regeln · ${SITE_NAME}` },
};

export default function CommunityRegelnPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader title="BoundTime: Über die Community & Regeln" />

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

        <p>Die Nichteinhaltung der Communityregeln kann zum sofortigen Ausschluss aus der Gemeinschaft führen.</p>
      </PublicArticle>

      <div className="mx-auto mt-10 flex max-w-3xl justify-center">
        <Link
          href="/register"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-8 py-3.5 text-center text-sm font-semibold text-amber-50 shadow-[0_16px_40px_-24px_rgba(180,140,60,0.35)] transition-[transform,background-color,border-color] duration-200 hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transform-none sm:min-w-[240px]"
        >
          Jetzt kostenlos registrieren
        </Link>
      </div>
    </Container>
  );
}
