import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicArticle } from "@/components/public/PublicArticle";

export default function CommunityRegelnPage() {
  return (
    <Container className="py-12 md:py-16">
      <PublicPageHeader
        title="Community-Regeln"
        subtitle="Orientierung für respektvolles Miteinander auf BoundTime."
      />
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

        <p>
          Die Nichteinhaltung der Communityregeln kann zum sofortigen Ausschluss aus der Gemeinschaft führen.
        </p>
      </PublicArticle>
    </Container>
  );
}
