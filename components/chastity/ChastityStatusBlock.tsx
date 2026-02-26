"use client";

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
    const statusText = locked
      ? null
      : asSubArrangement
        ? "Warte auf Lock durch Dom"
        : "Nicht verschlossen";
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-3 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-4">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 sm:gap-3">
            {locked ? (
              <LockKeyhole
                className="h-8 w-8 shrink-0 text-accent sm:h-10 sm:w-10"
                strokeWidth={1.5}
                aria-label="Verschlossen"
              />
            ) : (
              <UnlockKeyhole
                className="h-8 w-8 shrink-0 text-gray-500 sm:h-10 sm:w-10"
                strokeWidth={1.5}
                aria-label="Nicht verschlossen"
              />
            )}
            <span className="min-w-0 text-xs text-gray-300 sm:text-sm">
              {locked ? (
                <ChastityLockDuration
                  lockedAt={asSubArrangement!.lockedAt!}
                  arrangementId={asSubArrangement!.id}
                />
              ) : (
                statusText
              )}
              <span className="ml-1 text-gray-500 sm:ml-2">· Bound: {isBound ? "Gebunden" : "Frei"}</span>
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
        </div>
      </div>
    );
  }

  if (isDom && asDomArrangements.length > 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-3 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
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
                <div className="min-w-0 flex flex-col">
                  <span className="truncate text-xs text-gray-300 sm:text-sm">
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
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">Bound: {isBound ? "Gebunden" : "Frei"}</p>
      </div>
    );
  }

  if (isDom) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-3 shadow-sm transition-all duration-200 hover:border-gray-600 hover:shadow-md sm:p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <UnlockKeyhole
            className="h-8 w-8 shrink-0 text-gray-500 sm:h-10 sm:w-10"
            strokeWidth={1.5}
            aria-label="Keine Dynamik"
          />
          <span className="min-w-0 text-xs text-gray-500 sm:text-sm">Keine Dynamik · Bound: Frei</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-card p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <UnlockKeyhole
          className="h-8 w-8 shrink-0 text-gray-500 sm:h-10 sm:w-10"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="text-xs text-gray-500 sm:text-sm">Bound: Frei</span>
      </div>
    </div>
  );
}
