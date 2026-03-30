/**
 * Kanonische Basis-URL für Sitemaps, Canonicals, Schema.org und Open Graph.
 * Setze NEXT_PUBLIC_SITE_URL (oder SITE_URL) in Production auf die Live-Domain.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://boundtime.de";
  return raw.replace(/\/+$/, "");
}

export const SITE_NAME = "BoundTime";

/** Startseite & Fallback für globale Meta */
export const SITE_TITLE_DEFAULT =
  "BoundTime – Cuckolding, Wifesharing & Keuschhaltung";
export const SITE_DESCRIPTION_DEFAULT =
  "Deutschsprachige Community mit klaren Regeln und Verifizierung: Schwerpunkt Cuckolding, Wifesharing, Mensharing und strukturierte Keuschhaltung – für Paare, Solos und Bulls. Kein anonymer Schnellkontaktmarkt.";
