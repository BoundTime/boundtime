"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type BadgeDef = { id: string; title: string; description: string | null; icon_emoji: string | null };
type BadgeEarned = { badge_id: string; earned_at: string; chastity_badge_definitions: BadgeDef | null };

export function ChastityStreakAndBadges({
  arrangementId,
  currentStreakDays,
  longestStreakDays,
  totalLockedDays,
}: {
  arrangementId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  totalLockedDays?: number;
}) {
  const level =
    (totalLockedDays ?? longestStreakDays) >= 90
      ? "Gold"
      : (totalLockedDays ?? longestStreakDays) >= 30
        ? "Silber"
        : (totalLockedDays ?? longestStreakDays) >= 7
          ? "Bronze"
          : null;
  const [badges, setBadges] = useState<BadgeEarned[]>([]);

  useEffect(() => {
    createClient()
      .from("chastity_badges_earned")
      .select("badge_id, earned_at, chastity_badge_definitions(id, title, description, icon_emoji)")
      .eq("arrangement_id", arrangementId)
      .order("earned_at", { ascending: false })
      .then(({ data }) => setBadges(data ?? []));
  }, [arrangementId]);

  return (
    <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900/50 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
        Streaks & Badges
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
          Level: {level ?? "—"}
        </span>
        <span className="text-sm text-amber-400">
          🔥 Streak: {currentStreakDays} Tag{currentStreakDays !== 1 ? "e" : ""}
        </span>
        <span className="text-sm text-gray-400">
          Längste Serie: {longestStreakDays} Tag{longestStreakDays !== 1 ? "e" : ""}
        </span>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.badge_id}
                title={b.chastity_badge_definitions?.description ?? b.badge_id}
                className="rounded-full bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200"
              >
                {b.chastity_badge_definitions?.icon_emoji ?? "🏆"}{" "}
                {b.chastity_badge_definitions?.title ?? b.badge_id}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-500">Noch keine Badges</span>
        )}
      </div>
    </div>
  );
}
