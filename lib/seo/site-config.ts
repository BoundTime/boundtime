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

/** Startseite & Fallback für globale Meta (Claims angeglichen an öffentliche Landing) */
export const SITE_TITLE_DEFAULT = "BoundTime – Cuckold Community";
export const SITE_DESCRIPTION_DEFAULT =
  "Vernetzung, Austausch und Dating – diskret, verifiziert, respektvoll. Cuckold-Community von Cuckoldpaaren für die Szene.";
