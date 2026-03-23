import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";

export default function ImpressumPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader
        title="Impressum"
        subtitle="Angaben gemäß gesetzlicher Informationspflichten."
      />
      <PublicArticle>
        <p>
          BoundTime ist eine deutschsprachige Community-Plattform für erwachsene Nutzerinnen und
          Nutzer, die Austausch, Begegnung und diskrete Kontakte im BDSM-Kontext suchen. Die
          Plattform versteht sich als sichere und respektvolle Umgebung. Der Zugang ist
          ausschließlich Volljährigen vorbehalten. Die Nutzung erfolgt auf Grundlage der AGB und
          Community-Regeln.
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
