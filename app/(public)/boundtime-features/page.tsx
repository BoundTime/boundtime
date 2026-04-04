import Link from "next/link";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";

export default function BoundTimeFeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(127,31,43,0.22),transparent_60%)]" />
        <Container className="relative">
          <PublicPageHeader eyebrow="BoundTime" title="Was sind BoundTime- Features?" />

          <PublicArticle>
            <p>
              BoundTime- Features (BTF) sind optionale Varianten, die den Besonderheiten einer Cuckoldbeziehung und dem
              Dreieck Hotwife–Cuckold–Bull Rechnung tragen.
            </p>
            <p>BoundTime bietet folgende BTF:</p>

            <h2>1. Cuckymode (nur für Paare)</h2>
            <p>
              Beim Cuckymode wird die Hotwife zur Administratorin und vergibt dem Cuckold die Berechtigungen, die sie für
              angemessen hält. Während die Hotwife vollumfänglich sämtliche Funktionen des Mitgliederbereichs nutzen kann,
              kann sie den Cuckold von gewissen Themenbereichen ausschließen.
            </p>
            <p>
              Sie kann ihm gestatten, Nachrichten zu lesen, aber nicht zu beantworten. Wenn sie ihren Cuckold quälen
              möchte, kann sie ihn jederzeit vom laufenden Schriftverkehr mit anderen Usern ausschließen.
            </p>
            <h3>Ablauf</h3>
            <ul>
              <li>Die Hotwife aktiviert den Modus und legt das Cuckymode-Paarpasswort fest.</li>
              <li>
                Cucky kann beim Schreiben/Kommunizieren nur per Passwort (freigeschaltet) wieder aktiv sein – je nach
                Optionen auch bei Bildern.
              </li>
            </ul>
            <p>
              Der Cuckymode macht klare Regeln sichtbar und dient dazu, über den Cuckold innerhalb der Community zu
              bestimmen.
            </p>

            <h2>2. Keuschhaltungs-Vereinbarungen und BoundDollars</h2>
            <p>
              Ziel der Keuschheitsvereinbarung ist es, andere Mitglieder an der Dynamik der eigenen Cuckoldbeziehung
              teilhaben zu lassen.
            </p>

            <h3>a) Paarvereinbarungen</h3>
            <p>
              Keuschhaltungs-Vereinbarungen regeln Absprachen zwischen Hotwife und Cuckold und werden über das Paarprofil
              im Mitgliederbereich sichtbar gemacht.
            </p>
            <p>
              <strong>Bsp. 1:</strong> Die Hotwife kann dem Cuckold befehlen, für einen gewissen Zeitraum verschlossen sein
              zu müssen. Für die Erfüllung der Aufgabe kann sie BoundDollars (BD) ausloben. BD sind eine Fantasywährung
              innerhalb der Plattform – kein echtes Geld. BD können nicht gegen echtes Geld gekauft werden und sind
              außerhalb der Dynamik keine Währung. Sie entstehen nur im Zusammenhang mit erledigten Aufgaben und dienen als
              „Werte“ für vereinbarte Belohnungen.
            </p>
            <p>
              <strong>Bsp. 2:</strong> Die Hotwife kann dem Cuckold befehlen, innerhalb eines fest definierten Zeitraumes
              ein Date mit einem Bull zu arrangieren (hierzu sind die entsprechenden Berechtigungen für den Cuckold
              erforderlich) und dafür eine Belohnung oder eine Bestrafung bei Nichterfüllung auszusprechen.
            </p>
            <p>
              Hat der Cuckold genügend BD gesammelt, kann er sie gegen eine Belohnung eintauschen. Über die Profildaten des
              Cuckold sind gesammelte BD ersichtlich.
            </p>
            <p>
              Solange die Keuschhaltungs-Vereinbarung vom Cuckold nicht vollumfänglich erfüllt ist, erhält sie über das
              Profil den Status „aktiv“. Erst, wenn die Hotwife die Aufgabe als „erledigt“ markiert, erhält sie den Status
              „abgeschlossen“ und die ausgelobten BD werden dem Cuckold gutgeschrieben. Über den BD-Status ist jederzeit
              öffentlich sichtbar, wie gehorsam der Cuckold ist.
            </p>

            <h3>b) Dreiecksvereinbarungen</h3>
            <p>Cuckoldaufgaben können auch zwischen Hotwife und Solomann für den Cuckold bestimmt werden.</p>
            <p>Es gelten dieselben Regeln wie bei Paarvereinbarungen.</p>

            <p className="!mt-10 text-sm">
              <Link href="/ueber-uns">Was ist BoundTime? →</Link>
              {" · "}
              <Link href="/community-regeln">Community-Regeln →</Link>
            </p>
          </PublicArticle>
        </Container>
      </section>
    </div>
  );
}
