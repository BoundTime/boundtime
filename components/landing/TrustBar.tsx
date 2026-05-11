import { ShieldCheck, Lock, MapPin, Users } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "Alle Profile verifiziert" },
  { icon: Lock, text: "Ende-zu-Ende diskret" },
  { icon: MapPin, text: "Server in Deutschland" },
  { icon: Users, text: "Community von Paaren für Paare" },
];

export function TrustBar() {
  return (
    <div
      className="py-5"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-5 md:flex-row md:gap-12 md:px-8">
        {items.map(({ icon: Icon, text }, i) => (
          <div key={text} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className="hidden h-4 w-px md:block"
                style={{ background: "var(--border-subtle)" }}
              />
            )}
            <Icon size={18} style={{ color: "var(--text-gold)" }} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
