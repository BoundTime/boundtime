import Link from "next/link";
import { Eye } from "lucide-react";

type Visitor = {
  id: string;
  nick: string | null;
  lastSeenAt: string | null;
  viewedAt: string;
};

type Props = {
  visitors: Visitor[];
};

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  if (mins < 1) return "gerade";
  if (mins < 60) return `vor ${mins} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  return d.toLocaleDateString("de-DE");
}

export function VisitorsCard({ visitors }: Props) {
  if (visitors.length === 0) return null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-gray-500" strokeWidth={1.75} />
          <span className="text-[13px] font-medium text-white">Profilbesuche</span>
        </div>
        <Link href="/dashboard/aktivitaet/besucher" className="text-[11px] text-gray-500 hover:text-gray-300">
          Alle →
        </Link>
      </div>

      {visitors.map((v) => {
        const initials = (v.nick ?? "?")
          .split(/[\s_]+/)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const online = isOnline(v.lastSeenAt);

        return (
          <Link
            key={`${v.id}-${v.viewedAt}`}
            href={`/dashboard/entdecken/${v.id}`}
            className="flex items-center gap-3 px-3.5 py-2.5 border-b border-white/[0.05] last:border-0 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="relative shrink-0">
              <div
                className="flex items-center justify-center rounded-full text-white text-[12px] font-semibold bg-[#333]"
                style={{ width: 30, height: 30 }}
              >
                {initials}
              </div>
              <span
                className="absolute bottom-0 right-0 rounded-full border border-[var(--card,#1a1a1a)]"
                style={{ width: 8, height: 8, background: online ? "#22C55E" : "rgba(255,255,255,0.2)" }}
              />
            </div>
            <p className="flex-1 min-w-0 text-[13px] text-white truncate">{v.nick ?? "?"}</p>
            <p className="shrink-0 text-[11px] text-gray-500">{formatTime(v.viewedAt)}</p>
          </Link>
        );
      })}
    </div>
  );
}
