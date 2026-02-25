import { Container } from "@/components/Container";

export default function ImpressumPage() {
  return (
    <Container className="py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white">Impressum</h1>
        <p className="mt-4 text-gray-400">
          BoundTime ist eine deutschsprachige Community-Plattform für erwachsene Nutzerinnen und
          Nutzer, die Austausch, Begegnung und diskrete Kontakte im BDSM-Kontext suchen. Die
          Plattform versteht sich als sichere und respektvolle Umgebung. Der Zugang ist
          ausschließlich Volljährigen vorbehalten. Die Nutzung erfolgt auf Grundlage der AGB und
          Community-Regeln.
        </p>
        <p className="mt-4 text-gray-400">
          Nach § 5 des Digitale-Dienste-Gesetzes (DDG) sowie den Bestimmungen des Rundfunkstaatsvertrags
          müssen wir als Anbieter bestimmte Angaben bereitstellen. Für BoundTime zeichnet Andreas
          Kremer, Brunnenstr. 5, 87640 Biessenhofen, verantwortlich. Bei Fragen, Anregungen oder
          technischen Problemen können Sie uns jederzeit per E-Mail unter{" "}
          <a href="mailto:kontakt@boundtime.de" className="text-accent hover:underline">
            kontakt@boundtime.de
          </a>{" "}
          erreichen. Die Plattform wird privat und ehrenamtlich betrieben, es besteht kein
          gewerbliches Angebot. Für redaktionelle Inhalte im Sinne von § 55 Abs. 2 RStV ist dieselbe
          Person verantwortlich. Weitere Informationen zum Umgang mit Ihren Daten finden Sie in
          unserer{" "}
          <a href="/datenschutz" className="text-accent hover:underline">
            Datenschutzerklärung
          </a>
          .
        </p>
        <p className="mt-4 text-gray-400">
          Wir freuen uns über Ihr Interesse an BoundTime und bemühen uns um eine zügige Beantwortung
          Ihrer Anfragen. Bitte nutzen Sie für datenschutzrechtliche Anfragen die im Impressum
          genannte Kontaktmöglichkeit.
        </p>
      </article>
    </Container>
  );
}
