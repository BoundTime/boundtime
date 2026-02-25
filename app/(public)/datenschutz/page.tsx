import { Container } from "@/components/Container";

export default function DatenschutzPage() {
  return (
    <Container className="py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white">Datenschutzerklärung</h1>
        <p className="mt-4 text-gray-400">
          Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Die nachstehenden Hinweise geben
          einen Überblick darüber, wie Ihre Daten verarbeitet werden. Für Rückfragen wenden Sie sich
          bitte an die im Impressum genannte Kontaktadresse.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Verantwortliche Stelle</h2>
        <p className="mt-2 text-gray-400">
          Verantwortlich für die Datenverarbeitung ist der Betreiber dieser Plattform. Kontaktdaten
          und weitere Angaben finden Sie im{" "}
          <a href="/impressum" className="text-accent hover:underline">
            Impressum
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Server-Logdateien</h2>
        <p className="mt-2 text-gray-400">
          Beim Aufruf unserer Website werden durch den Hosting-Dienst (Supabase bzw. den eingesetzten
          Hosting-Provider) automatisch Zugriffsdaten (z.&nbsp;B. IP-Adresse, Datum und Uhrzeit des
          Zugriffs, aufgerufene Seite, Browsertyp) in Logdateien gespeichert. Diese Daten werden zur
          Gewährleistung des Betriebs, zur Fehlersuche und zur Sicherheit verarbeitet. Die
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse). Die
          Daten werden in der Regel nach kurzer Zeit gelöscht, sofern keine längeren
          Aufbewahrungspflichten bestehen.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Konkret verarbeitete Daten</h2>
        <p className="mt-2 text-gray-400">
          Im Rahmen der Nutzung werden unter anderem folgende Daten verarbeitet (Platzhalter – an
          tatsächliche Funktionen anpassen):
        </p>
        <ul className="mt-2 list-disc pl-6 text-gray-400 space-y-1">
          <li>
            <strong className="text-gray-300">Registrierung:</strong> E-Mail, Nick (Anzeigename),
            Geschlecht, Rolle (Dom/Sub/Switcher), Geburtsdatum (zur Altersprüfung).
          </li>
          <li>
            <strong className="text-gray-300">Profil:</strong> Freiwillige Angaben wie Ort, Größe,
            Gewicht, Vorlieben, Erwartungen, „Über mich“-Text.
          </li>
          <li>
            <strong className="text-gray-300">Fotos und Alben:</strong> Hochgeladene Profilbilder
            und Fotoalben, inkl. optionaler FSK18-Markierung.
          </li>
          <li>
            <strong className="text-gray-300">Nachrichten:</strong> Inhalte von Direktnachrichten
            zwischen Nutzern.
          </li>
          <li>
            <strong className="text-gray-300">Keuschhaltung / Chastity:</strong> Daten zu
            Arrangements, Check-ins, Aufgaben etc., soweit Sie diese Funktionen nutzen.
          </li>
          <li>
            <strong className="text-gray-300">Verifizierung:</strong> Zur Verifizierung können
            Ausweisdokumente (Fotos) hochgeladen werden. Diese Daten sind besonders sensibel und
            fallen unter Art. 9 DSGVO (besondere Kategorien personenbezogener Daten). Die
            Verarbeitung erfolgt nur auf Grundlage Ihrer Einwilligung und zur Alters- bzw.
            Identitätsprüfung gemäß den Nutzungsbedingungen.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-white">Cookies und vergleichbare Technologien</h2>
        <p className="mt-2 text-gray-400">
          Wir setzen Cookies und vergleichbare Speichertechnologien (z.&nbsp;B. Local Storage) ein:
        </p>
        <ul className="mt-2 list-disc pl-6 text-gray-400 space-y-2">
          <li>
            <strong className="text-gray-300">Session-Cookies / technisch notwendige Cookies:</strong>{" "}
            Für die Anmeldung und Sitzungsverwaltung werden Cookies verwendet. Diese sind für den
            Betrieb der Plattform erforderlich (Rechtsgrundlage: berechtigtes Interesse bzw.
            Vertragserfüllung). Ohne diese Cookies kann die Anmeldung nicht funktionieren.
          </li>
          <li>
            <strong className="text-gray-300">Cookie-Einwilligung:</strong> Beim ersten Besuch werden
            Sie über die Cookie-Nutzung informiert und können diese akzeptieren. Ihre Einwilligung
            wird im Local Storage Ihres Browsers gespeichert, damit das Hinweisbanner nicht bei jedem
            Besuch erneut erscheint. Sie können die gespeicherte Einwilligung jederzeit über die
            Browsereinstellungen löschen; dann erscheint das Banner erneut.
          </li>
        </ul>
        <p className="mt-2 text-gray-400">
          Weitere Einzelheiten zu den von uns genutzten Diensten (Supabase, Google Fonts) finden Sie
          unter „Drittanbieter“.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Rechtsgrundlagen</h2>
        <p className="mt-2 text-gray-400">
          Die Verarbeitung erfolgt auf folgenden Rechtsgrundlagen:
        </p>
        <ul className="mt-2 list-disc pl-6 text-gray-400 space-y-1">
          <li>
            <strong className="text-gray-300">Vertragserfüllung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO):</strong>{" "}
            Konto, Bereitstellung der Dienste, Profildaten
          </li>
          <li>
            <strong className="text-gray-300">Einwilligung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a, ggf. Art.&nbsp;9 Abs.&nbsp;2 lit.&nbsp;a DSGVO):</strong>{" "}
            Verifizierungsfotos, optionale Profilangaben, Cookie-Einwilligung
          </li>
          <li>
            <strong className="text-gray-300">Berechtigtes Interesse (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO):</strong>{" "}
            Sicherheit, Missbrauchsabwehr, Server-Logs
          </li>
          <li>
            <strong className="text-gray-300">Gesetzliche Verpflichtung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO):</strong>{" "}
            Aufbewahrungsfristen (z.&nbsp;B. steuerrechtlich)
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-white">Drittanbieter</h2>
        <p className="mt-2 text-gray-400">
          <strong className="text-gray-300">Supabase:</strong> Hosting, Datenbank und
          Authentifizierung werden über Supabase bereitgestellt. Dabei können Daten in der EU und
          ggf. in den USA verarbeitet werden. Es gelten die Datenschutzinformationen von Supabase
          sowie eine Vereinbarung zur Auftragsverarbeitung (AV-Vertrag). Weitere Informationen:{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            supabase.com/privacy
          </a>
          . Bei produktivem Einsatz die gewählte Region (EU/US) und ggf. Standardvertragsklauseln
          angeben.
        </p>
        <p className="mt-4 text-gray-400">
          <strong className="text-gray-300">Google Fonts (Plus Jakarta Sans):</strong> Zur
          Darstellung von Schriften werden Schriftarten von Google-Servern abgerufen. Dabei können
          Verbindungsdaten an Google (USA) übermittelt werden. Weitere Informationen finden Sie in
          der Datenschutzerklärung von Google:{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            policies.google.com/privacy
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Speicherdauer</h2>
        <p className="mt-2 text-gray-400">
          Personenbezogene Daten werden grundsätzlich nur so lange gespeichert, wie sie für die
          Bereitstellung der Dienste erforderlich sind oder Sie eingewilligt haben. Konkrete
          Orientierung:
        </p>
        <ul className="mt-2 list-disc pl-6 text-gray-400 space-y-1">
          <li>Profildaten, Nachrichten: Bis zur Kontolöschung</li>
          <li>
            Verifizierungsfotos: Nach Abschluss der Prüfung und ggf. Löschung des Kontos; ggf.
            längere Aufbewahrung bei Verdacht auf Missbrauch oder auf Anordnung
          </li>
          <li>Server-Logs: Üblicherweise wenige Tage bis maximal einige Wochen</li>
        </ul>
        <p className="mt-2 text-gray-400">
          Gesetzliche Aufbewahrungsfristen (z.&nbsp;B. steuerrechtlich) bleiben vorbehalten.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Ihre Rechte</h2>
        <p className="mt-2 text-gray-400">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der
          Verarbeitung Ihrer Daten sowie auf Datenübertragbarkeit. Sofern die Verarbeitung auf
          Einwilligung beruht, können Sie diese jederzeit widerrufen; die Rechtmäßigkeit der bis
          dahin erfolgten Verarbeitung bleibt unberührt. Sie haben ein Widerspruchsrecht (Art.&nbsp;21
          DSGVO) gegen die Verarbeitung, soweit diese auf berechtigtem Interesse beruht. Sie haben
          ferner das Recht, sich bei einer Aufsichtsbehörde zu beschweren. Eine Übersicht der
          Landesdatenschutzbehörden finden Sie unter{" "}
          <a
            href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            BfDI – Landesdatenschutzbehörden
          </a>
          .
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Stand: {new Date().getFullYear()}. Bei Änderungen der Verarbeitung werden wir diese
          Erklärung aktualisieren.
        </p>
      </article>
    </Container>
  );
}
