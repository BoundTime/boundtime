/** Gleiches Online-Fenster wie OnlineIndicator (Minuten) */
export const ONLINE_THRESHOLD_MINUTES = 5;

export function isProfileOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  const last = new Date(lastSeenAt).getTime();
  const now = Date.now();
  return now - last <= ONLINE_THRESHOLD_MINUTES * 60 * 1000;
}

/**
 * Relative Zeit seit letztem `last_seen_at` (de-DE), für „Zuletzt online: …“.
 * Konsistent mit NotificationBell / üblichen formatTimeAgo-Mustern im Projekt.
 */
export function formatLastSeenRelative(iso: string | null): string {
  if (!iso) return "unbekannt";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unbekannt";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString("de-DE");
}

/** Sichtbarer Text inkl. Präfix */
export function formatLastSeenDisplay(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "Zuletzt online: noch nicht aktiv";
  return `Zuletzt online: ${formatLastSeenRelative(lastSeenAt)}`;
}

export function lastSeenAriaLabel(lastSeenAt: string | null): string {
  if (isProfileOnline(lastSeenAt)) return "Aktuell online";
  return formatLastSeenDisplay(lastSeenAt);
}
