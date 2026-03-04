import { Container } from "@/components/Container";

export default function CommunityRegelnPage() {
  return (
    <Container className="py-16">
      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold text-white">Community-Regeln</h1>

        <p className="mt-6 text-gray-300 leading-relaxed">
          Ziel der Community ist die Vernetzung von Menschen, die in der Welt des Cuckolding leben oder sich dieser zugehörig fühlen.
        </p>
        <p className="mt-2 text-gray-300">Hierzu gehören:</p>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-300">
          <li>Cuckoldpaare</li>
          <li>Lover, Hausfreunde &amp; Bulls</li>
          <li>Femdom-Solodamen</li>
          <li>Devote Solomänner auf der Suche nach einer Femdom oder Hotwife</li>
        </ul>

        <p className="mt-6 text-gray-300 leading-relaxed">
          Vernetzung im Sinne der Community bedeutet Austausch, Verabredungen und Treffen zwischen den Mitgliedern.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Regeln der Community</h2>
        <p className="mt-3 text-gray-300 leading-relaxed">
          Die Community lebt von einem respektvollen und zuverlässigen Miteinander der Teilnehmer:innen. Cuckolding bedeutet insbesondere für Solomänner keine ausschließliche Suche nach schnellem Sex, sondern die Akzeptanz einer Lebensform, in welcher der Cuckold und seine Partnerin beidseitig und vollumfänglich einbezogen werden.
        </p>

        <h3 className="mt-6 text-lg font-semibold text-white">Teilnahme in der Community</h3>
        <p className="mt-2 text-gray-300 leading-relaxed">
          Grundsätzlich steht die Community im Rahmen der Registrierung Jedermann und Jederfrau aus den o.&nbsp;a. Zielgruppen offen.
        </p>
        <p className="mt-3 text-gray-300 leading-relaxed">
          Im Rahmen des Registrierungsprozesses behält sich der Betreiber vor, für den dauerhaften Verbleib in der Community Teilnahmebegründungen einzufordern.
        </p>

        <p className="mt-6 text-gray-300 leading-relaxed">
          Die Nichteinhaltung der Communityregeln kann zum sofortigen Ausschluss aus der Gemeinschaft führen.
        </p>
      </article>
    </Container>
  );
}
