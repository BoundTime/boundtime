export function VerifiedBadge({ label = "Verifiziert" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: "rgba(91,168,255,0.12)",
        color: "var(--verified)",
        border: "1px solid rgba(91,168,255,0.30)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path
          d="M5 0.5L6.18 3.31L9.27 3.57L7 5.54L7.7 8.57L5 6.99L2.3 8.57L3 5.54L0.73 3.57L3.82 3.31L5 0.5Z"
          fill="currentColor"
        />
      </svg>
      {label}
    </span>
  );
}
