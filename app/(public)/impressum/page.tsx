import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";
import { SITE_NAME } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${SITE_NAME}.`,
  alternates: { canonical: "/impressum" },
  openGraph: { title: `Impressum · ${SITE_NAME}` },
};

export default function ImpressumPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader
        title="Impressum"
        subtitle="Angaben gemäß gesetzlicher Informationspflichten."
      />
      <PublicArticle>
        <p>
          BoundTime ist eine deutschsprachige Community-Plattform für volljährige Nutzerinnen und
          Nutzer mit Schwerpunkt Cuckolding und Wifesharing, Mensharing sowie strukturierter
          Keuschhaltung – eingebettet in einen weiteren BDSM- und Beziehungskontext. Adressiert werden
          unter anderem Paare, Einzelprofile und Bulls; die Plattform versteht sich als
          vertrauensvolle, respektvolle Umgebung mit klaren{" "}
          <a href="/community-regeln">Community-Regeln</a>. Der Zugang ist ausschließlich
          Volljährigen vorbehalten. Die Nutzung erfolgt auf Grundlage der{" "}
          <a href="/agb">AGB</a> und der Community-Regeln.
        </p>
        <p className="mt-4">
          Nach § 5 des Digitale-Dienste-Gesetzes (DDG) sowie den Bestimmungen des Rundfunkstaatsvertrags
          müssen wir als Anbieter bestimmte Angaben bereitstellen. Für BoundTime zeichnet Andreas
          Kremer, Brunnenstr. 5, 87640 Biessenhofen, verantwortlich. Bei Fragen, Anregungen oder
          technischen Problemen können Sie uns jederzeit per E-Mail unter{" "}
          <a href="mailto:kontakt@boundtime.de">
            kontakt@boundtime.de
          </a>{" "}
          erreichen. Die Plattform wird privat und ehrenamtlich betrieben, es besteht kein
          gewerbliches Angebot. Für redaktionelle Inhalte im Sinne von § 55 Abs. 2 RStV ist dieselbe
          Person verantwortlich. Weitere Informationen zum Umgang mit Ihren Daten finden Sie in
          unserer{" "}
          <a href="/datenschutz">
            Datenschutzerklärung
          </a>
          .
        </p>
        <p className="mt-4">
          Wir freuen uns über Ihr Interesse an BoundTime und bemühen uns um eine zügige Beantwortung
          Ihrer Anfragen. Bitte nutzen Sie für datenschutzrechtliche Anfragen die im Impressum
          genannte Kontaktmöglichkeit.
        </p>
      </PublicArticle>
    </Container>
  );
}
