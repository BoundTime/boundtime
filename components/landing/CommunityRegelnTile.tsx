"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Scale } from "lucide-react";

const COMMUNITY_REGELN_INTRO =
  "Ziel der Community ist die Vernetzung von Menschen, die in der Welt des Cuckolding leben oder sich dieser zugehörig fühlen.";

export function CommunityRegelnTile() {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="flex min-h-[200px] flex-col rounded-2xl border border-gray-700 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-600 hover:shadow-md sm:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Scale className="h-6 w-6 text-accent" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold leading-tight text-white">
        Community-Regeln
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">
        {COMMUNITY_REGELN_INTRO}
      </p>
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
        >
          Weiterlesen
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-400">
          <p>Hierzu gehören: Cuckoldpaare, Lover, Hausfreunde &amp; Bulls, Femdom-Solodamen, devote Solomänner auf der Suche nach einer Femdom oder Hotwife.</p>
          <p>Vernetzung im Sinne der Community bedeutet Austausch, Verabredungen und Treffen zwischen den Mitgliedern.</p>
          <p className="font-medium text-gray-300">Regeln der Community</p>
          <p>Die Community lebt von einem respektvollen und zuverlässigen Miteinander. Cuckolding bedeutet insbesondere für Solomänner keine ausschließliche Suche nach schnellem Sex, sondern die Akzeptanz einer Lebensform, in welcher der Cuckold und seine Partnerin beidseitig einbezogen werden.</p>
          <p className="font-medium text-gray-300">Teilnahme</p>
          <p>Grundsätzlich steht die Community Jedermann und Jederfrau aus den genannten Zielgruppen offen. Der Betreiber kann Teilnahmebegründungen einfordern. Nichteinhaltung der Regeln kann zum Ausschluss führen.</p>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
          >
            Weniger anzeigen
            <ChevronUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
      <p className="mt-3 text-xs text-gray-500">
        <Link href="/community-regeln" className="text-accent hover:underline">
          Vollständige Regeln auf separater Seite →
        </Link>
      </p>
    </article>
  );
}
