/**
 * Server-only: Restriction-Punkt (rot/grün). Wird vom Layout gerendert,
 * damit der Client den Wert nicht überschreiben kann.
 */
export function RestrictionDot({ enabled }: { enabled: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 shrink-0"
      title={enabled ? "Cuckymode aktiv – Passwort nötig zum Schreiben" : "Cuckymode aus"}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: enabled ? "#ef4444" : "#22c55e" }}
        aria-hidden
      />
      <span className="hidden text-[10px] text-gray-400 lg:inline" aria-label={enabled ? "Cuckymode an" : "Cuckymode aus"}>
        {enabled ? "Cuckymode an" : "Cuckymode aus"}
      </span>
    </span>
  );
}

/** Mobile-Variante (nur Punkt + Tooltip-Text). */
export function RestrictionDotMobile({ enabled }: { enabled: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 shrink-0"
      title={enabled ? "Cuckymode aktiv" : "Cuckymode aus"}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: enabled ? "#ef4444" : "#22c55e" }}
        aria-hidden
      />
      <span className="text-[10px] text-gray-400">
        {enabled ? "Cuckymode aktiv" : "Cuckymode aus"}
      </span>
    </span>
  );
}
