import Link from "next/link";
import { Container } from "@/components/Container";

export default function BoundTimeFeaturesPage() {
  return (
    <Container className="py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white">BoundTime Features</h1>

        <p className="mt-6 text-gray-300 leading-relaxed">
          Diese Seite ist für Besucher/innen gedacht, die sich noch vor der Registrierung orientieren möchten.
          Du findest hier eine klare Einordnung von BoundTime sowie verständliche Erklärungen zu wichtigen Begriffen
          und Prozessen.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">1) Einordnung: Worum geht es bei BoundTime?</h2>
        <p className="mt-3 text-gray-300 leading-relaxed">
          BoundTime ist eine deutschsprachige Community für Cuckoldpaare, Bulls und weitere Ausrichtungen rund um
          Cuckolding, Keuschhaltung und vernetzte Begegnung. Im Mittelpunkt stehen Austausch, Vertrauen und ein
          respektvoller Umgang auf Augenhöhe.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">2) Begriffe verständlich erklärt</h2>
        <ul className="mt-3 list-disc pl-6 space-y-2 text-gray-300">
          <li>
            <strong>Cuckymode</strong>: Cuckymode gibt es nur für <strong>Paare</strong>. Die <strong>Hotwife</strong> aktiviert
            den Modus und legt dabei das <strong>Cuckymode-Paarpasswort</strong> fest. Damit wird Cucky beim
            Schreiben/Kommunizieren (und je nach Einstellungen auch beim Ansehen von Bildern) eingeschränkt – nach
            Freischalten mit Passwort kannst du wieder wie vereinbart kommunizieren.
          </li>
          <li>
            <strong>Keuschhaltungs-Vereinbarungen</strong>: Männer (Keuschlinge) lassen sich von <strong>Damen</strong> oder
            dominanten Herren keusch halten. Das funktioniert über <strong>Aufgaben</strong> und ihre
            <strong>Ausführung</strong>. Für erledigte Aufgaben können <strong>Keuschlinge</strong> <strong>BoundDollars (BD)</strong> verdienen
            und diese anschließend für <strong>Belohnungen</strong> nutzen, die <strong>Damen</strong> kaufen und anbieten (z. B. zeitlich
            begrenzte Freilassung aus dem Cage).
          </li>
          <li>
            <strong>BoundDollars</strong>: BD sind die <strong>Währung</strong>, um Belohnungen im Rahmen der Dynamik zu
            ermöglichen. BD entstehen durch erledigte Aufgaben bei der Keuschhaltung und können anschließend für
            Angebote/Belohnungen genutzt werden – damit können <strong>Damen</strong> z. B. zeitlich begrenzte Freilassung aus dem Cage
            ermöglichen.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-white">3) Strenge Prüfung für Solomänner</h2>
        <p className="mt-3 text-gray-300 leading-relaxed">
          Damit BoundTime für alle Mitglieder sicher und respektvoll bleibt, gibt es für <strong>Solomänner</strong> eine
          <strong>strenge Prüfung</strong>. Diese dient dazu, Missbrauch zu reduzieren und sicherzustellen, dass die
          Community-Teilnahme den eigenen Vorstellungen entspricht.
        </p>

        <p className="mt-3 text-gray-300 leading-relaxed">
          <strong>Was bedeutet „strenge Prüfung“ grob?</strong>
        </p>
        <ul className="mt-2 list-disc pl-6 space-y-2 text-gray-300">
          <li>Du durchläufst einen nachvollziehbaren Verifizierungs- bzw. Prüfprozess.</li>
          <li>Es werden Informationen abgeglichen, die zur Community-Teilnahme passen.</li>
          <li>Erst nach erfolgreichem Abschluss ist die Teilnahme in vollem Umfang möglich.</li>
        </ul>

        <p className="mt-4 text-gray-300 leading-relaxed">
          Wenn du vorab Fragen hast: In den <Link className="text-accent hover:underline" href="/community-regeln">Community-Regeln</Link>{" "}
          findest du weitere Hinweise zum respektvollen Miteinander.
        </p>

        <div className="mt-8 rounded-xl border border-gray-700 bg-card p-5">
          <h3 className="text-lg font-semibold text-white">Kurzer Hinweis</h3>
          <p className="mt-2 text-gray-300 leading-relaxed">
            Die Details zur Verifizierung und zu einzelnen Features sind im Registrierungsprozess und im Dashboard erklärt.
            Diese Seite soll dir aber vorher helfen, die wichtigsten Begriffe einzuordnen.
          </p>
        </div>
      </article>
    </Container>
  );
}

