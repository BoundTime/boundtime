"use client";

import Link from "next/link";
import { LockKeyhole, UnlockKeyhole } from "lucide-react";
import { ChastityLockDuration } from "./ChastityLockDuration";
import { BoundDollarsProgress } from "./BoundDollarsProgress";

type ChastityStatusBlockProps = {
  role: string | null;
  profileBoundDollars?: number;
  asSubArrangement: {
    id: string;
    lockedAt: string | null;
    boundDollars?: number;
    rewardGoalBoundDollars?: number;
  } | null;
  asDomArrangements: Array<{
    id: string;
    subNick: string;
    subAvatarUrl: string | null;
    lockedAt: string | null;
    boundDollars?: number;
    rewardGoalBoundDollars?: number;
  }>;
};

export function ChastityStatusBlock({
  role,
  asSubArrangement,
  asDomArrangements,
  profileBoundDollars,
}: ChastityStatusBlockProps) {
  const isSub = role === "Sub" || role === "Switcher";
  const isDom = role === "Dom" || role === "Switcher";

  const isBound = !!asSubArrangement || asDomArrangements.length > 0;

  if (isSub) {
    const locked = !!asSubArrangement?.lockedAt;
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {locked ? (
              <LockKeyhole
                className="h-10 w-10 shrink-0 text-accent"
                strokeWidth={1.5}
                aria-label="Verschlossen"
              />
            ) : (
              <UnlockKeyhole
                className="h-10 w-10 shrink-0 text-gray-500"
                strokeWidth={1.5}
                aria-label="Nicht verschlossen"
              />
            )}
            <span className="text-sm text-gray-300">
              {locked ? (
                <ChastityLockDuration
                  lockedAt={asSubArrangement!.lockedAt!}
                  arrangementId={asSubArrangement!.id}
                />
              ) : asSubArrangement ? (
                "Noch nicht verschlossen (Dom startet Lock)"
              )               : (
                "Nicht verschlossen"
              )}
              <span className="ml-2 text-gray-500">· Bound: {isBound ? "Gebunden" : "Frei"}</span>
            </span>
            {profileBoundDollars != null && profileBoundDollars > 0 && !asSubArrangement && (
              <p className="mt-2 text-sm text-gray-400">Dein Konto: {profileBoundDollars} BD</p>
            )}
            {(asSubArrangement?.boundDollars != null || asSubArrangement?.rewardGoalBoundDollars != null) && (
              <div className="mt-2">
                <BoundDollarsProgress
                  boundDollars={asSubArrangement!.boundDollars ?? 0}
                  rewardGoalBoundDollars={asSubArrangement!.rewardGoalBoundDollars}
                  showLabel={true}
                />
              </div>
            )}
          </div>
          <Link
            href="/dashboard/keuschhaltung"
            className="shrink-0 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
          >
            Keuschhaltung →
          </Link>
        </div>
      </div>
    );
  }

  if (isDom && asDomArrangements.length > 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {asDomArrangements.slice(0, 4).map((arr) => (
              <div
                key={arr.id}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-600 bg-background">
                  {arr.subAvatarUrl ? (
                    <img
                      src={arr.subAvatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                      {(arr.subNick ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <LockKeyhole
                  className="h-8 w-8 shrink-0 text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300">
                    {arr.lockedAt ? (
                      <ChastityLockDuration
                        lockedAt={arr.lockedAt}
                        arrangementId={arr.id}
                      />
                    ) : (
                      <span className="text-gray-500">Noch nicht verschlossen</span>
                    )}
                  </span>
                  {(arr.boundDollars != null || arr.rewardGoalBoundDollars != null) && (
                    <div className="mt-1 w-24">
                      <BoundDollarsProgress
                        boundDollars={arr.boundDollars ?? 0}
                        rewardGoalBoundDollars={arr.rewardGoalBoundDollars}
                        showLabel={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {asDomArrangements.length > 4 && (
              <span className="text-sm text-gray-400">
                +{asDomArrangements.length - 4} weitere
              </span>
            )}
          </div>
          <Link
            href="/dashboard/keuschhaltung"
            className="shrink-0 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
          >
            Keuschhaltung →
          </Link>
        </div>
        <p className="mt-2 text-xs text-gray-500">Bound: {isBound ? "Gebunden" : "Frei"}</p>
      </div>
    );
  }

  if (isDom) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UnlockKeyhole
              className="h-10 w-10 shrink-0 text-gray-500"
              strokeWidth={1.5}
              aria-label="Keine Dynamik"
            />
            <span className="text-sm text-gray-500">Keine Dynamik</span>
            <span className="text-gray-500">· Bound: Frei</span>
          </div>
          <Link
            href="/dashboard/keuschhaltung"
            className="shrink-0 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
          >
            Keuschhaltung →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <UnlockKeyhole
          className="h-10 w-10 shrink-0 text-gray-500"
          strokeWidth={1.5}
          aria-hidden
        />
          <span className="text-sm text-gray-500">Bound: Frei</span>
          <Link
            href="/dashboard/keuschhaltung"
            className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
          >
            Keuschhaltung →
          </Link>
        </div>
      </div>
    );
}
