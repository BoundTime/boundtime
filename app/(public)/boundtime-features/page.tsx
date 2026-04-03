"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { PublicSectionHeading } from "@/components/public/PublicSectionHeading";
import { CollapsibleSection } from "@/components/settings/CollapsibleSection";
import type { LucideProps } from "lucide-react";
import { ChevronRight, ShieldCheck, Sparkles, Lock } from "lucide-react";

type TocItem = { id: string; label: string; step: string };

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useActiveSection(items: TocItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { root: null, threshold: [0.15, 0.25, 0.4] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

function InfoCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-gray-800/40 p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-gray-300">{children}</div>
    </div>
  );
}

function StepCard({
  num,
  title,
  text,
  active,
  onClick,
}: {
  num: string;
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group text-left rounded-xl border bg-black/40 backdrop-blur-sm p-5 transition-all",
        "hover:border-gray-600 hover:shadow-sm hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        active ? "border-accent/60 shadow-[0_0_0_1px_rgba(127,31,43,0.25)]" : "border-white/[0.1]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2">
          <span
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold",
              active ? "border-accent/50 bg-accent/15 text-accent" : "border-white/[0.1] bg-gray-900/40 text-gray-300",
            ].join(" ")}
          >
            {num}
          </span>
          <span className="text-base font-semibold text-white">{title}</span>
        </span>
        <ChevronRight className={["h-5 w-5 text-gray-400 transition-transform", active ? "translate-x-0.5 rotate-0" : "group-hover:translate-x-0.5"].join(" ")} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">{text}</p>
    </button>
  );
}

function HeroMapCard({ onNavigate }: { onNavigate: (id: string) => void }) {
  const nodes: Array<{ id: string; label: string; x: number; y: number }> = [
    { id: "einordnung", label: "Einordnung", x: 70, y: 50 },
    { id: "cuckymode", label: "Cuckymode", x: 225, y: 95 },
    { id: "keuschhaltung", label: "Keuschhaltung", x: 210, y: 210 },
    { id: "strenge-pruefung", label: "Strenge Prüfung", x: 65, y: 245 },
  ];

  return (
    <div className="relative h-[320px] w-full rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(127,31,43,0.25),transparent_55%)]" />
      <div className="absolute inset-0">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          <defs>
            <linearGradient id="bt-accent-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(127,31,43)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(143,36,50)" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M150 150 L70 85" stroke="url(#bt-accent-line)" strokeWidth="2" fill="none" />
          <path d="M150 150 L225 110" stroke="url(#bt-accent-line)" strokeWidth="2" fill="none" />
          <path d="M150 150 L210 235" stroke="url(#bt-accent-line)" strokeWidth="2" fill="none" />
          <path d="M150 150 L70 245" stroke="url(#bt-accent-line)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div
        className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-accent/40 bg-accent/10"
        style={{ transform: "translate(-50%, -50%) rotate(45deg)" }}
      >
        <div className="-rotate-45 text-center">
          <div className="text-sm font-semibold text-white">BoundTime</div>
          <div className="mt-1 text-[10px] font-medium text-gray-400">Feature Map</div>
        </div>
      </div>

      {nodes.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => onNavigate(n.id)}
          className="absolute"
          style={{ left: n.x, top: n.y }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-gray-900/30 px-3 py-1 text-xs font-medium text-gray-200 hover:border-accent/60 hover:text-white transition-colors">
            {n.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function BoundTimeFeaturesPage() {
  const tocItems: TocItem[] = useMemo(
    () => [
      { id: "einordnung", label: "Einordnung", step: "01" },
      { id: "cuckymode", label: "Cuckymode", step: "02" },
      { id: "keuschhaltung", label: "Keuschhaltungs-Vereinbarungen", step: "03" },
      { id: "strenge-pruefung", label: "Strenge Prüfung", step: "04" },
    ],
    []
  );

  const activeId = useActiveSection(tocItems);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(127,31,43,0.22),transparent_60%)]" />
        <Container className="relative">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/55">
                  BoundTime
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
                  Was ist BoundTime?
                </h1>
                <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-gray-300">
                  <p>
                    BoundTime ist eine Cuckold Community von Cuckoldpaaren für die Cuckoldszene. BoundTime verfolgt das
                    Ziel, den Austausch innerhalb der Szene zu fördern und Kontakte zwischen den User-/Innen zu
                    ermöglichen.
                  </p>
                  <h2 className="text-sm font-semibold text-white sm:text-base">BoundTime richtet sich an:</h2>
                  <ul className="list-disc space-y-2 pl-5 text-gray-300">
                    <li>Cuckold (-Interessierte)- Paare</li>
                    <li>Paare in einer Femdom- Beziehung</li>
                    <li>Paare, die in einer Keuschhaltungsbeziehung leben</li>
                    <li>Solomänner auf der Suche nach einer Beziehung zu Cuckoldpaaren</li>
                    <li>Devote Solomänner auf der Suche nach dominanten Singlefrauen</li>
                    <li>Dominante Solodamen auf der Suche nach devoten Singlemännern</li>
                  </ul>
                  <p>
                    Als Plattformbetreiber stellt BoundTime im Rahmen der Aufnahmekriterien sicher, dass Fakeprofile
                    keinen Zutritt erhalten und User-/Innen, deren Nutzungsverhalten gegen die Communityziele verstößt,
                    von einer weiteren Teilnahme ausgeschlossen werden.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Nur für Erwachsene (18+)", "Respekt & klare Regeln", "Diskret", "Datenschutz"].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center rounded-full border border-white/[0.1] bg-black/35 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-6 py-3.5 text-center text-sm font-semibold text-amber-50 transition-colors hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Kostenlos registrieren
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3.5 text-center text-sm font-medium text-gray-100 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Zurück zur Startseite
                  </Link>
                </div>
                <p className="mt-4 text-sm">
                  <Link
                    href="/community-regeln"
                    className="font-medium text-amber-200/75 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
                  >
                    Community-Regeln lesen
                  </Link>
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              {/* Desktop map */}
              <div className="hidden lg:block">
                <HeroMapCard onNavigate={(id) => scrollToId(id)} />
              </div>

              {/* Mobile map list */}
              <div className="lg:hidden">
                <div className="rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Feature Map</div>
                    <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <div className="mt-4 grid gap-2">
                    {tocItems.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => scrollToId(it.id)}
                        className={[
                          "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                          "border-white/[0.1] bg-gray-900/30 hover:border-accent/50",
                          activeId === it.id ? "border-accent/60" : "",
                        ].join(" ")}
                      >
                        <span className="text-sm font-semibold text-white">{it.label}</span>
                        <span className="text-xs text-gray-400">{it.step}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Step-by-step */}
      <section className="border-t border-white/[0.06] py-8 sm:py-12">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <PublicSectionHeading
              align="left"
              eyebrow="Ablauf"
              title="In vier Schritten verstanden"
              description="Wähle einen Abschnitt – gleiche Struktur wie auf der Startseite, mehr Tiefe hier."
              className="max-w-xl md:mb-0"
            />
            <div className="hidden shrink-0 md:flex items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-black/40 backdrop-blur-sm px-3 py-2">
                <Lock className="h-4 w-4 text-accent" aria-hidden />
                Respekt &amp; klare Regeln
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              num="01"
              title="Orientieren"
              text="Du lernst die wichtigsten Begriffe kennen, bevor du dich registrierst."
              active={activeId === "einordnung"}
              onClick={() => scrollToId("einordnung")}
            />
            <StepCard
              num="02"
              title="Profil & Rollen"
              text="Du legst fest, welche Dynamiken zu dir passen – klar und respektvoll."
              active={activeId === "cuckymode"}
              onClick={() => scrollToId("cuckymode")}
            />
            <StepCard
              num="03"
              title="Features im Alltag"
              text="Cuckymode und Keuschhaltungs-Vereinbarungen strukturieren Absprachen."
              active={activeId === "keuschhaltung"}
              onClick={() => scrollToId("keuschhaltung")}
            />
            <StepCard
              num="04"
              title="Vertrauen & Sicherheit"
              text="Für Solomänner gibt es eine strenge Prüfung, damit es sicher bleibt."
              active={activeId === "strenge-pruefung"}
              onClick={() => scrollToId("strenge-pruefung")}
            />
          </div>

          {/* Mobile chips */}
          <div className="mt-6 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tocItems.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => scrollToId(it.id)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                    "border-white/[0.1] bg-black/40 backdrop-blur-sm text-gray-200 hover:border-accent/60",
                    activeId === it.id ? "border-accent/70 text-white" : "",
                  ].join(" ")}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Content + Toc */}
      <section className="py-8 sm:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold text-white">Inhaltsverzeichnis</h3>
                <div className="mt-3 space-y-2">
                  {tocItems.map((it) => {
                    const isActive = activeId === it.id;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => scrollToId(it.id)}
                        className={[
                          "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                          isActive ? "border-accent/60 bg-accent/10" : "border-white/[0.1] bg-gray-900/30",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={isActive ? "text-white font-semibold" : "text-gray-300 font-medium"}>{it.label}</span>
                          <span className="text-xs text-gray-400">{it.step}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9">
              {/* D1 */}
              <div id="einordnung" className="scroll-mt-24">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold text-white">Einordnung</h2>
                </div>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  BoundTime ist eine deutschsprachige Community, in der respektvoller Umgang, klare Kommunikation und Diskretion im Mittelpunkt stehen.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-5">
                    <h3 className="text-sm font-semibold text-white">Was passiert hier?</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {["Profile entdecken", "Absprachen strukturieren", "Nachrichten & Kontakt"].map((v) => (
                        <div key={v} className="rounded-xl border border-white/[0.1] bg-gray-900/30 p-3 text-sm text-gray-300">
                          {v}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Kurz gesagt: Du verstehst die Begriffe – dann entscheidest du, ob es zu dir passt.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <CollapsibleSection title="Für wen ist BoundTime?" defaultOpen={false}>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Für Cuckoldpaare, Bulls und weitere Ausrichtungen im BDSM-Kontext – mit Fokus auf Consent, Respekt und vernetzte Begegnung.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Ist das für mich, wenn ich neu bin?" defaultOpen={false}>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Ja. Diese Seite erklärt die wichtigsten Begriffe verständlich – ohne Vorwissen vorauszusetzen.
                      </p>
                    </CollapsibleSection>
                  </div>
                </div>
              </div>

              {/* D2 */}
              <div id="cuckymode" className="scroll-mt-24 mt-10">
                <h2 className="text-2xl font-bold text-white">Cuckymode</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Cuckymode ist eine Paar-Option, die Absprachen klar sichtbar macht – mit Passwort-Freischaltung, wenn Cucky schreiben/kommunizieren will.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <CollapsibleSection title="Was ist Cuckymode?" defaultOpen>
                      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                        <li>
                          Cuckymode gibt es <strong>nur für Paare</strong>.
                        </li>
                        <li>
                          Die <strong>Hotwife</strong> aktiviert den Modus und legt das <strong>Cuckymode-Paarpasswort</strong> fest.
                        </li>
                        <li>
                          Cucky kann beim Schreiben/Kommunizieren nur per Passwort (freigeschaltet) wieder aktiv sein – je nach Optionen auch bei Bildern.
                        </li>
                      </ul>
                    </CollapsibleSection>
                    <CollapsibleSection title="Was ändert sich im Alltag?">
                      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                        <li>Schreiben/Kommunizieren funktioniert im Modus erst nach Freischalten.</li>
                        <li>Je nach deinen Optionen können auch Bilder eingeschränkt sein.</li>
                        <li>Absprachen werden dadurch weniger missverständlich.</li>
                      </ul>
                    </CollapsibleSection>
                    <CollapsibleSection title="Wie wird wieder freigeschaltet?">
                      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                        <li>Hotwife hat ein Passwort hinterlegt.</li>
                        <li>Nach Eingabe ist Schreiben/Kommunizieren wieder möglich.</li>
                        <li>Du kannst Cuckymode auch wieder aufheben, wenn es nicht mehr gelten soll.</li>
                      </ul>
                    </CollapsibleSection>
                  </div>

                  <div className="space-y-4">
                    <InfoCallout title="Warum gibt es das?">
                      Cuckymode ist ein Werkzeug für Absprachen: Es macht klare Regeln sichtbar und hilft, Missverständnisse zu vermeiden.
                    </InfoCallout>
                    <InfoCallout title="Jugendfrei & respektvoll">
                      Keine expliziten Beschreibungen – nur Kommunikation und Absprachen. Alles ist darauf ausgelegt, dass du dich sicher fühlst.
                    </InfoCallout>
                  </div>
                </div>
              </div>

              {/* D3 */}
              <div id="keuschhaltung" className="scroll-mt-24 mt-10">
                <h2 className="text-2xl font-bold text-white">Keuschhaltungs-Vereinbarungen</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Keuschhaltung ist ein Konzept für klar geregelte Aufgaben und Belohnungen – transparent innerhalb der Vereinbarung.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <CollapsibleSection title="Vereinbarung starten" defaultOpen>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        In der Dynamik wird kurz geklärt, welche Rollen und welche Ziele dazu passen. Alles basiert auf Vereinbarung – nichts „einfach so“.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Aufgaben & Ausführung">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Aufgaben sind der Kern: Du siehst, worum es geht, und welche Ausführung gewünscht ist. Erledigte Aufgaben zählen im Rahmen der Vereinbarung.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Punkte sammeln">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Für erledigte Aufgaben können <strong>Keuschlinge</strong> <strong>BoundDollars (BD)</strong> gutgeschrieben bekommen.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Belohnungen abholen (ab Ziel)">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Sobald ein Ziel erreicht ist, können vereinbarte Belohnungen genutzt werden – z. B. eine zeitlich begrenzte Freilassung aus dem Cage (je nach Vereinbarung).
                      </p>
                    </CollapsibleSection>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-5">
                      <h3 className="text-lg font-semibold text-white">BoundDollars (BD)</h3>
                      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                        BD sind eine <strong>Fantasywährung</strong> innerhalb der Plattform – kein echtes Geld.
                      </p>
                      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                        BD können nicht gegen echtes Geld gekauft werden und sind außerhalb der Dynamik keine Währung. Sie entstehen nur im Zusammenhang mit erledigten Aufgaben und dienen als „Werte“ für vereinbarte Belohnungen.
                      </p>
                      <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                        Beispiel: <strong>zeitlich begrenzte Freilassung aus dem Cage</strong>.
                      </p>
                    </div>
                    <InfoCallout title="Consent & klare Regeln">
                      Nichts passiert ohne Vereinbarung. Beide Seiten legen fest, was gilt und was nicht – damit es vorher klar ist.
                    </InfoCallout>
                  </div>
                </div>
              </div>

              {/* D4 */}
              <div id="strenge-pruefung" className="scroll-mt-24 mt-10">
                <h2 className="text-2xl font-bold text-white">Strenge Prüfung für Solomänner</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Damit BoundTime sicher und respektvoll bleibt, gibt es für Solomänner eine strenge Prüfung.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <CollapsibleSection title="Nachvollziehbarer Prüfprozess" defaultOpen>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Du durchläufst einen verständlichen, nachvollziehbaren Prozess.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Informationen werden abgeglichen">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Es werden Informationen abgeglichen, die zur Community-Teilnahme passen.
                      </p>
                    </CollapsibleSection>
                    <CollapsibleSection title="Teilnahme nach erfolgreichem Abschluss">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Erst nach dem erfolgreichen Abschluss ist Teilnahme in vollem Umfang möglich.
                      </p>
                    </CollapsibleSection>
                  </div>

                  <div className="space-y-4">
                    <InfoCallout title="Warum wir das transparent halten">
                      Wir wollen Vertrauen aufbauen und Missbrauch reduzieren – bevor jemand in die Community startet.
                    </InfoCallout>
                    <div className="rounded-2xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-5">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Wenn du vorab mehr wissen willst:
                      </p>
                      <Link
                        href="/community-regeln"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-accent/60 bg-accent/15 px-4 py-3 text-sm font-medium text-accent hover:border-accent"
                      >
                        Weitere Regeln & respektvolles Miteinander →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Closing */}
              <div className="mt-10 rounded-3xl border border-white/[0.1] bg-black/40 backdrop-blur-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white">Bereit, BoundTime kennenzulernen?</h2>
                <p className="mt-2 text-gray-300 leading-relaxed">
                  Diese Seite hilft dir beim Einstieg. Danach kannst du dich registrieren und dein Profil in Ruhe ausrichten.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-6 py-3.5 text-center font-medium text-white transition-all hover:bg-accent-hover"
                  >
                    Kostenlos registrieren
                  </Link>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Du kannst jederzeit vor dem Start lesen, was auf dich zukommt.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

