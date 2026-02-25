import { Container } from "@/components/Container";

export default function CommunityRegelnPage() {
  return (
    <Container className="py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white">Community-Regeln</h1>
        <p className="mt-4 text-gray-400">
          Um ein respektvolles und sicheres Miteinander zu gewährleisten, bitten wir alle
          Nutzerinnen und Nutzer, die folgenden Regeln zu beachten.{" "}
          <strong className="text-gray-300">(Platzhalter – für den Produktivbetrieb verbindliche Fassung erforderlich.)</strong>
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Respekt und Einverständnis</h2>
        <p className="mt-2 text-gray-400">
          Jeder Kontakt basiert auf gegenseitigem Respekt und klarem Consent. Unerwünschte
          Ansprachen, Belästigung oder Druck sind nicht gestattet.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Altersgrenze und FSK18</h2>
        <p className="mt-2 text-gray-400">
          Die Plattform ist ausschließlich volljährigen Personen vorbehalten. Nutzung durch
          Minderjährige ist strengstens verboten und führt zur sofortigen Löschung des Kontos.
          Bestimmte Inhalte (z.&nbsp;B. Fotos in Alben) können als FSK18 gekennzeichnet sein; der
          Zugang kann eine Verifizierung voraussetzen. Die Einhaltung der Altersgrenze wird
          vorausgesetzt.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Diskretion und Datenschutz</h2>
        <p className="mt-2 text-gray-400">
          Persönliche Daten und Gesprächsinhalte anderer Nutzerinnen und Nutzer dürfen nicht ohne
          ausdrückliche Zustimmung weitergegeben oder veröffentlicht werden.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Verbotene Inhalte und Verhalten</h2>
        <p className="mt-2 text-gray-400">
          Illegale Inhalte, Hassrede, Diskriminierung und Verstöße gegen geltendes Recht sind
          untersagt. Verstöße können zur Sperrung des Zugangs führen.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Konsequenzen bei Verstößen</h2>
        <p className="mt-2 text-gray-400">
          Bei Verstößen gegen diese Regeln oder die AGB behalten wir uns vor, Inhalte zu entfernen,
          Nutzer zu verwarnen oder den Zugang zeitweise oder dauerhaft zu sperren. Schwerwiegende
          Verstöße können zur Kündigung des Nutzungsvertrages führen.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Meldemöglichkeit</h2>
        <p className="mt-2 text-gray-400">
          Verdächtige oder regelwidrige Inhalte oder Verhalten können an die im Impressum genannte
          Kontaktadresse oder über eine in der Anwendung bereitgestellte Meldemöglichkeit
          gemeldet werden.
        </p>

        <div className="mt-8 rounded-lg border border-amber-600/30 bg-amber-950/20 p-4 text-sm text-amber-200/90">
          <strong>Hinweis:</strong> Diese Community-Regeln sind ein Platzhalter für die lokale
          Entwicklung. Für den produktiven Betrieb sind vollständige und verbindliche Regeln
          erforderlich.
        </div>
      </article>
    </Container>
  );
}
