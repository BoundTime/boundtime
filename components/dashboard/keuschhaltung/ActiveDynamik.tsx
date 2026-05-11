import Link from "next/link";
import { Lock } from "lucide-react";
import { Countdown } from "./Countdown";

type Props = {
  arrangementId: string;
  partnerNick: string;
  lockedAt: string;
  daysTotal: number;
  daysBound: number;
  rewardDescription: string | null;
  rewardGoalBd: number;
  currentBd: number;
  targetDate: string;
};

export function ActiveDynamik({
  arrangementId,
  partnerNick,
  lockedAt,
  daysTotal,
  daysBound,
  rewardDescription,
  rewardGoalBd,
  currentBd,
  targetDate,
}: Props) {
  const progressPct = daysTotal > 0 ? Math.min(100, Math.round((daysBound / daysTotal) * 100)) : 0;
  const daysLeft = Math.max(0, daysTotal - daysBound);

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ border: "1px solid rgba(123,17,17,0.25)", background: "var(--card, #1a1a1a)" }}
    >
      {/* Roter Akzentbalken */}
      <div style={{ height: 3, background: "#7B1111" }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#7B1111" }}>
              Aktive Dynamik
            </p>
            <h2 className="text-[16px] font-medium text-white mt-0.5">{partnerNick}</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Gestartet: {new Date(lockedAt).toLocaleDateString("de-DE")}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: "rgba(123,17,17,0.1)", color: "#7B1111" }}
          >
            Gebunden
          </span>
        </div>

        {/* Countdown */}
        <Countdown targetDate={targetDate} />

        {/* Fortschrittsbalken */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-gray-400">Fortschritt der Dynamik</span>
            <span className="text-[12px] font-medium text-white">{progressPct}%</span>
          </div>
          <div
            className="relative w-full overflow-hidden rounded-full"
            style={{ height: 8, background: "rgba(123,17,17,0.1)" }}
          >
            <div
              className="h-full rounded-full relative"
              style={{ width: `${progressPct}%`, background: "#7B1111" }}
            >
              <div
                className="absolute right-0 top-0 bottom-0 rounded-full"
                style={{ width: 3, background: "rgba(255,255,255,0.5)" }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-gray-500">Tag {daysBound} von {daysTotal}</span>
            <span className="text-[11px] text-gray-500">Noch {daysLeft} Tage</span>
          </div>
        </div>

        {/* Belohnungs-Karte */}
        <div
          className="rounded-md p-3"
          style={{ background: "rgba(201,169,81,0.05)", border: "1px solid rgba(201,169,81,0.2)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center rounded-md text-lg shrink-0"
              style={{ width: 32, height: 32, background: "rgba(201,169,81,0.1)", color: "#8A6D2E" }}
            >
              🎁
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-0.5">Belohnung bei Erfüllung</p>
              <p className="text-[13px] text-white">{rewardDescription || "Keine Beschreibung"}</p>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: "#8A6D2E" }}>
                {currentBd} / {rewardGoalBd} BD
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/keuschhaltung/${arrangementId}`}
          className="mt-4 flex items-center gap-2 text-[12px] transition-colors hover:text-white"
          style={{ color: "#7B1111" }}
        >
          <Lock size={12} />
          Details &amp; Aufgaben →
        </Link>
      </div>
    </div>
  );
}
