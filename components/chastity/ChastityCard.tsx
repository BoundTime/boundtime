"use client";

import Link from "next/link";
import { LockKeyhole, UnlockKeyhole } from "lucide-react";
import { ChastityLockDuration } from "./ChastityLockDuration";

type ChastityCardProps = {
  role: string | null;
  asSubArrangement: { lockedAt: string | null } | null;
  asDomArrangements: Array<{
    id: string;
    subNick: string;
    subAvatarUrl: string | null;
    lockedAt: string | null;
  }>;
};

export function ChastityCard({
  role,
  asSubArrangement,
  asDomArrangements,
}: ChastityCardProps) {
  const isSub = role === "Sub" || role === "Switcher";
  const isDom = role === "Dom" || role === "Switcher";

  let statusText: React.ReactNode = "Dynamiken & Aufgaben";
  let Icon = UnlockKeyhole;
  let iconClass = "text-gray-500";

  if (isSub && asSubArrangement) {
    if (asSubArrangement.lockedAt) {
      Icon = LockKeyhole;
      iconClass = "text-accent";
      statusText = <ChastityLockDuration lockedAt={asSubArrangement.lockedAt} />;
    } else {
      Icon = UnlockKeyhole;
      iconClass = "text-gray-500";
      statusText = "Noch nicht verschlossen (Dom startet Lock)";
    }
  } else if (isSub) {
    statusText = "Nicht verschlossen";
  } else if (isDom && asDomArrangements.length > 0) {
    Icon = LockKeyhole;
    iconClass = "text-accent";
    statusText =
      asDomArrangements.length === 1
        ? "1 Dynamik"
        : `${asDomArrangements.length} Dynamiken`;
  } else if (isDom) {
    statusText = "Keine Dynamik";
  }

  return (
    <Link
      href="/dashboard/keuschhaltung"
      className="flex flex-col rounded-xl border border-gray-700 bg-card p-6 transition-all duration-200 hover:border-gray-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
    >
      <Icon className={`h-8 w-8 ${iconClass}`} strokeWidth={1.5} aria-hidden />
      <span className="mt-3 font-semibold text-white">Keuschhaltung</span>
      <span className="mt-1 text-sm text-gray-400 line-clamp-2">{statusText}</span>
    </Link>
  );
}
