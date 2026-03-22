/** Einheitliche Anzeige für profiles.created_at */
export function formatMemberSince(createdAt: string | null | undefined): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return `Mitglied seit ${d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}`;
}
