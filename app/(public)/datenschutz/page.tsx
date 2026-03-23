import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";

export default function DatenschutzPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader
        title="Datenschutzerklärung"
        subtitle="Überblick zur Verarbeitung personenbezogener Daten auf BoundTime."
      />
      <PublicArticle>
        <p>
          Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Die nachstehenden Hinweise geben
          einen Überblick darüber, wie Ihre Daten verarbeitet werden. Für Rückfragen wenden Sie sich
          bitte an die im Impressum genannte Kontaktadresse.
        </p>

        <h2>Verantwortliche Stelle</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist der Betreiber dieser Plattform. Kontaktdaten
          und weitere Angaben finden Sie im{" "}
          <a href="/impressum">Impressum</a>.
        </p>

        <h2>Überblick: Wo läuft was?</h2>
        <p>
          Die öffentlich erreichbare Website (Frontend) wird über{" "}
          <strong className="text-gray-300">Vercel</strong> ausgeliefert. Datenbank, Authentifizierung,
          Dateispeicher (z.&nbsp;B. Bilder) und serverseitige Funktionen der Anwendung werden über{" "}
          <strong className="text-gray-300">Supabase</strong> betrieben. Technische Zugriffs- und
          Protokolldaten können dabei sowohl im Umfeld von Vercel als auch von Supabase anfallen; die
          inhaltlichen Nutzerdaten (Profil, Nachrichten, Medien usw.) werden in der Regel in der von
          Supabase bereitgestellten Infrastruktur gespeichert und verarbeitet.
        </p>

        <h2>Server-Logdateien und technische Zugriffsdaten</h2>
        <p>
          Beim Aufruf der Website und ihrer Schnittstellen werden durch den Betrieb von Hosting- und
          Infrastrukturdiensten automatisch technische Informationen verarbeitet, insbesondere
          IP-Adresse, Datum und Uhrzeit des Zugriffs, angeforderte Ressource, übertragene Datenmenge
          sowie Browsertyp/-version, soweit vom Client übermittelt. Diese Verarbeitung dient der
          Bereitstellung, Stabilität und Sicherheit des Dienstes (Fehleranalyse, Missbrauchsabwehr).
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse). Die
          Aufbewahrungsdauer richtet sich nach den Vorgaben der jeweiligen Dienste und ist üblicherweise
          begrenzt.
        </p>

        <h2>Konkret verarbeitete Daten</h2>
        <p>
          Im Rahmen der Nutzung von BoundTime können insbesondere folgende Daten verarbeitet werden,
          soweit Sie die jeweiligen Funktionen nutzen oder Daten angeben:
        </p>
        <ul className="mt-2 space-y-2">
          <li>
            <strong className="text-gray-300">Registrierung und Konto:</strong> E-Mail-Adresse,
            Passwort (als Hash), Anzeigename (Nick), Geschlecht, Geburtsdatum (Altersprüfung), Rolle
            (z.&nbsp;B. Dom, Sub, Switcher, Bull), Kontotyp (Einzel- oder Paarprofil), bei Paaren ggf.
            Paarart und weitere im Registrierungsformular erfasste Angaben.
          </li>
          <li>
            <strong className="text-gray-300">Profil:</strong> Freiwillige Angaben wie Ort, Postleitzahl,
            Größe, Gewicht, Orientierung, Vorlieben, Erwartungen, Erfahrungsgrad, „Über mich“-Texte,
            Sichtbarkeitseinstellungen sowie ggf. weitere im Profileditor erfasste Felder.
          </li>
          <li>
            <strong className="text-gray-300">Standort für die Entdecken-Funktion:</strong> Aus
            Postleitzahl und/oder Ort können Koordinaten (Breite/Länge) berechnet und im Profil
            gespeichert werden, um Umkreissuchen zu ermöglichen. Die Geokodierung erfolgt über den
            Dienst <strong className="text-gray-300">Nominatim</strong> (OpenStreetMap); es werden nur
            die zur Abfrage nötigen Parameter übermittelt.
          </li>
          <li>
            <strong className="text-gray-300">Fotos und Alben:</strong> Hochgeladene Bilder,
            Profilfotos, Alben und Freigaben inkl. optionaler Kennzeichnungen (z.&nbsp;B. FSK18).
          </li>
          <li>
            <strong className="text-gray-300">Nachrichten:</strong> Inhalte von Konversationen und
            Direktnachrichten sowie ggf. Anhänge und Zustell-/Lesestatus, soweit die Funktion genutzt
            wird.
          </li>
          <li>
            <strong className="text-gray-300">Feed und soziale Interaktion:</strong> Beiträge,
            Kommentare, Likes sowie Follow-Beziehungen zwischen Profilen.
          </li>
          <li>
            <strong className="text-gray-300">Benachrichtigungen:</strong> In der App erzeugte
            Hinweise (z.&nbsp;B. zu Nachrichten, Vereinbarungen, Verifizierung), soweit aktiviert.
          </li>
          <li>
            <strong className="text-gray-300">Aktivität und Profilinteraktion:</strong> z.&nbsp;B.
            Profilaufrufe (Besucherübersicht), Likes auf Profile oder Beiträge – soweit diese
            Funktionen angeboten und von Ihnen ausgelöst werden.
          </li>
          <li>
            <strong className="text-gray-300">Keuschhaltung (Chastity):</strong> Daten zu
            Vereinbarungen, Aufgaben, Nachweisen, Punkten/Währungen im Rahmen der Funktion, Check-ins
            und ggf. zugehörige Benachrichtigungen.
          </li>
          <li>
            <strong className="text-gray-300">Einschränkungen / Paarfunktionen (z.&nbsp;B.
            Cuckymode):</strong> technische und organisatorische Einstellungen, die Sie im Rahmen
            dieser Features setzen (z.&nbsp;B. Passworthashes für Freischaltungen), ohne deren Inhalt
            hier im Einzelnen aufzuzählen.
          </li>
          <li>
            <strong className="text-gray-300">Foren:</strong> Themen und Beiträge im allgemeinen Forum
            sowie im Dom-Forum, soweit Sie dort aktiv werden.
          </li>
          <li>
            <strong className="text-gray-300">Verifizierung:</strong> Zur Verifizierung können
            Ausweisdokumente oder andere Nachweise (Fotos) hochgeladen werden. Diese Daten sind
            besonders sensibel und können unter Art.&nbsp;9 DSGVO fallen. Die Verarbeitung erfolgt zur
            Durchführung der vorgesehenen Prüfung auf Grundlage der Nutzungsbedingungen und ggf. Ihrer
            Einwilligung.
          </li>
          <li>
            <strong className="text-gray-300">Sperrlisten:</strong> Daten zu blockierten Profilen,
            soweit Sie die Blockfunktion nutzen.
          </li>
          <li>
            <strong className="text-gray-300">E-Mail-Versand:</strong> Für Bestätigungs- und
            Transaktionsmails wird die E-Mail-Infrastruktur von Supabase Auth genutzt; der Betreiber
            kann zusätzlich einen Dienst wie <strong className="text-gray-300">Resend</strong> oder
            einen <strong className="text-gray-300">SMTP-Anbieter</strong> (z.&nbsp;B. Hosting-Postfach)
            einsetzen. Verarbeitet werden mindestens Empfängeradresse und Inhalt der jeweiligen
            Nachricht.
          </li>
        </ul>

        <h2>Cookies und vergleichbare Technologien</h2>
        <p>
          Wir setzen Cookies und vergleichbare Speichertechnologien (z.&nbsp;B. Local Storage) ein:
        </p>
        <ul className="mt-2 space-y-2">
          <li>
            <strong className="text-gray-300">Technisch notwendige Cookies (Session / Anmeldung):</strong>{" "}
            Für die Anmeldung und Sitzungsverwaltung werden Cookies verwendet, die für den Betrieb der
            Plattform erforderlich sind. Rechtsgrundlage: Vertragserfüllung bzw. berechtigtes Interesse
            gem. Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b bzw. f DSGVO.
          </li>
          <li>
            <strong className="text-gray-300">Hinweis-Banner (Local Storage):</strong> Wenn Sie den
            Datenschutzhinweis am unteren Bildschirmrand schließen, kann diese Auswahl lokal in Ihrem
            Browser gespeichert werden, damit der Hinweis nicht bei jedem Besuch erneut erscheint.
            Rechtsgrundlage: berechtigtes Interesse an einer nutzerfreundlichen Information gem.
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Sie können die Speicherung jederzeit löschen
            (Browsereinstellungen); der Hinweis erscheint dann erneut.
          </li>
          <li>
            <strong className="text-gray-300">Vercel Web Analytics:</strong> Zur Messung von
            Reichweite und Nutzung (z.&nbsp;B. Seitenaufrufe, aggregierte Nutzungsereignisse) setzen wir{" "}
            <strong className="text-gray-300">Vercel Web Analytics</strong> ein. Nach Angaben von
            Vercel werden dabei datenschutzfreundliche Verfahren genutzt; Details zu Umfang und
            Technik finden Sie in der Dokumentation von Vercel, u.&nbsp;a. unter{" "}
            <a
              href="https://vercel.com/docs/analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel.com/docs/analytics
            </a>{" "}
            und den dort verlinkten Datenschutzhinweisen. Die Verarbeitung kann auch in Drittländern
            (z.&nbsp;B. USA) erfolgen, soweit dies für den Dienst erforderlich ist; es gelten ggf.
            geeignete Garantien im Sinne der DSGVO. Rechtsgrundlage ist in der Regel Art.&nbsp;6
            Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes Interesse an der statistischen Auswertung und
            Verbesserung des Angebots).
          </li>
        </ul>
        <p className="mt-2">
          Weitere Einzelheiten zu eingebundenen Diensten finden Sie unter „Drittanbieter“.
        </p>

        <h2>Rechtsgrundlagen</h2>
        <p>Die Verarbeitung erfolgt insbesondere auf folgenden Rechtsgrundlagen:</p>
        <ul className="mt-2 space-y-2">
          <li>
            <strong className="text-gray-300">Vertragserfüllung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO):</strong>{" "}
            Konto, Bereitstellung der Plattform-Funktionen, Abwicklung der Nutzung innerhalb der
            vereinbarten Leistung.
          </li>
          <li>
            <strong className="text-gray-300">
              Einwilligung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a, ggf. Art.&nbsp;9 Abs.&nbsp;2 lit.&nbsp;a DSGVO):
            </strong>{" "}
            soweit wir ausdrücklich eine Einwilligung einholen (z.&nbsp;B. besondere Daten bei der
            Verifizierung, freiwillige Zusatzangaben, soweit nur auf Einwilligung gestützt).
          </li>
          <li>
            <strong className="text-gray-300">Berechtigtes Interesse (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO):</strong>{" "}
            Sicherheit, Missbrauchsabwehr, technische Logs, statistische Auswertung des Webangebots
            (Web Analytics), Speicherung der Banner-Auswahl.
          </li>
          <li>
            <strong className="text-gray-300">Gesetzliche Verpflichtung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO):</strong>{" "}
            soweit gesetzliche Aufbewahrungspflichten bestehen.
          </li>
        </ul>

        <h2>Drittanbieter</h2>
        <p>
          <strong className="text-gray-300">Supabase:</strong> Datenbank, Authentifizierung,
          Speicher (z.&nbsp;B. für Medien) und servernahe Funktionen. Daten können je nach
          Konfiguration des Projekts in der EU und ggf. in den USA oder anderen Regionen verarbeitet
          werden. Es gelten die Datenschutzinformationen von Supabase; für die Auftragsverarbeitung
          stehen ggf. Vertragswerkzeuge zur Verfügung.{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            supabase.com/privacy
          </a>
        </p>
        <p className="mt-4">
          <strong className="text-gray-300">Vercel:</strong> Hosting und Auslieferung des Frontends
          sowie Web Analytics wie oben beschrieben.{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            vercel.com/legal/privacy-policy
          </a>
        </p>
        <p className="mt-4">
          <strong className="text-gray-300">Google Fonts (Plus Jakarta Sans):</strong> Zur Darstellung
          von Schriftarten kann eine Verbindung zu Google-Servern aufgebaut werden; dabei können
          technische Verbindungsdaten übermittelt werden.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            policies.google.com/privacy
          </a>
        </p>
        <p className="mt-4">
          <strong className="text-gray-300">OpenStreetMap / Nominatim (Geokodierung):</strong> Zur
          Umrechnung von PLZ/Ort in Koordinaten kann eine Anfrage an den Nominatim-Dienst erfolgen.{" "}
          <a
            href="https://operations.osmfoundation.org/policies/nominatim/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nutzungsrichtlinien Nominatim
          </a>
        </p>
        <p className="mt-4">
          <strong className="text-gray-300">Resend oder SMTP-Anbieter:</strong> soweit der Betreiber
          E-Mails über diese Kanäle versendet, gelten deren jeweilige Datenschutzbedingungen.
        </p>

        <h2>Speicherdauer</h2>
        <p>
          Personenbezogene Daten werden grundsätzlich nur so lange gespeichert, wie sie für die
          Bereitstellung der Dienste erforderlich sind oder eine Einwilligung / gesetzliche Grundlage
          besteht. Orientierungswerte:
        </p>
        <ul className="mt-2 space-y-2">
          <li>Profildaten und Nachrichten: in der Regel bis zur Löschung des Kontos</li>
          <li>
            Verifizierungsunterlagen: nach Abschluss der Prüfung und gemäß interner Vorgaben bzw. bis
            zur Kontolöschung; längere Aufbewahrung nur bei berechtigtem Anlass (z.&nbsp;B.
            Missbrauchsermittlung) oder gesetzlicher Pflicht
          </li>
          <li>Technische Logs: typischerweise begrenzte Fristen gemäß Provider-Vorgaben</li>
        </ul>
        <p className="mt-2">
          Gesetzliche Aufbewahrungsfristen bleiben unberührt.
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung
          Ihrer Daten sowie auf Datenübertragbarkeit. Sofern die Verarbeitung auf Einwilligung beruht,
          können Sie diese mit Wirkung für die Zukunft widerrufen; die Rechtmäßigkeit der bis dahin
          erfolgten Verarbeitung bleibt unberührt. Sie haben ein Widerspruchsrecht (Art.&nbsp;21 DSGVO)
          gegen Verarbeitungen, die auf berechtigtem Interesse beruhen, soweit die Voraussetzungen der
          Norm erfüllt sind. Sie haben ferner das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
          Eine Übersicht der Landesdatenschutzbehörden:{" "}
          <a
            href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            BfDI – Landesdatenschutzbehörden
          </a>
          .
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Stand: {new Date().getFullYear()}. Bei Änderungen der Verarbeitung passen wir diese
          Erklärung an.
        </p>
      </PublicArticle>
    </Container>
  );
}
