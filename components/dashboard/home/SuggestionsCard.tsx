import Link from "next/link";
import { Sparkles } from "lucide-react";

type SuggestionProfile = {
  id: string;
  nick: string | null;
  role: string | null;
  city: string | null;
};

type Props = {
  suggestions: SuggestionProfile[];
};

const ROLE_COLORS: Record<string, string> = {
  Dom: "#8A6D2E",
  Sub: "#7B1111",
  Bull: "#a03030",
  Switcher: "#6b5b9e",
  Hotwife: "#9b3070",
};

export function SuggestionsCard({ suggestions }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-gray-500" strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-white">Empfehlungen</span>
        </div>
        <Link href="/dashboard/entdecken" className="text-[11px] text-gray-500 hover:text-gray-300">
          Mehr →
        </Link>
      </div>

      {/* Profile items */}
      {suggestions.map((p) => {
        const initials = (p.nick ?? "?")
          .split(/[\s_]+/)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <Link
            key={p.id}
            href={`/dashboard/entdecken/${p.id}`}
            className="flex items-center gap-3 px-3.5 py-2.5 border-b border-white/[0.05] last:border-0 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="relative shrink-0">
              <div
                className="flex items-center justify-center rounded-full text-white text-[13px] font-semibold"
                style={{ width: 34, height: 34, background: ROLE_COLORS[p.role ?? ""] ?? "#333" }}
              >
                {initials}
              </div>
              <span
                className="absolute bottom-0 right-0 rounded-full border border-[var(--card,#1a1a1a)]"
                style={{ width: 8, height: 8, background: "#22C55E" }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white truncate">{p.nick ?? "?"}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {[p.role, p.city].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span
              className="shrink-0 rounded-md border border-white/12 bg-transparent px-2.5 py-1 text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              Folgen
            </span>
          </Link>
        );
      })}
    </div>
  );
}
