import Link from "next/link";
import { Lock } from "lucide-react";

type Props = {
  arrangementId: string;
  partnerNick: string;
  daysBound: number;
  daysTotal: number;
  boundDollars: number;
};

export function KeuschhaltungWidget({ arrangementId, partnerNick, daysBound, daysTotal, boundDollars }: Props) {
  const progressPct = daysTotal > 0 ? Math.min(100, Math.round((daysBound / daysTotal) * 100)) : 0;
  const daysLeft = Math.max(0, daysTotal - daysBound);

  return (
    <Link
      href={`/dashboard/keuschhaltung/${arrangementId}`}
      className="block rounded-lg p-3.5 cursor-pointer transition-colors hover:bg-[rgba(123,17,17,0.08)]"
      style={{
        background: "rgba(123,17,17,0.05)",
        border: "1px solid rgba(123,17,17,0.2)",
        borderRadius: 10,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Lock size={13} className="text-[#7B1111]" strokeWidth={2} />
        <span className="text-[13px] font-medium text-[#7B1111]">Keuschhaltung</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "rgba(123,17,17,0.1)", color: "#7B1111" }}
        >
          Aktiv
        </span>
      </div>

      <p className="text-[12px] text-gray-500 mb-2.5">
        mit {partnerNick} · noch {daysLeft} Tage
      </p>

      {/* Fortschrittsbalken */}
      <div
        className="w-full overflow-hidden rounded-full mb-2.5"
        style={{ height: 5, background: "rgba(123,17,17,0.1)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${progressPct}%`, background: "#7B1111" }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-600">Tag {daysBound} / {daysTotal}</span>
        <span className="text-[11px] font-medium" style={{ color: "#8A6D2E" }}>
          {boundDollars} BD ›
        </span>
      </div>
    </Link>
  );
}
