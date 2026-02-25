"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type UnlockEntry = {
  id: string;
  start_at: string;
  end_at: string | null;
  duration_minutes: number | null;
  reward_title: string | null;
};

function formatDate(s: string) {
  return new Date(s).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ChastityUnlockLog({ arrangementId }: { arrangementId: string }) {
  const [entries, setEntries] = useState<UnlockEntry[]>([]);

  useEffect(() => {
    createClient()
      .from("chastity_unlock_log")
          .select("id, start_at, end_at, duration_minutes, reward_title")
      .eq("arrangement_id", arrangementId)
      .order("start_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setEntries(data ?? []));
  }, [arrangementId]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Unlock-Log</h3>
      <p className="mt-1 text-sm text-gray-500">
        Zeiten ohne Keuschheitsgürtel (für effektive Gesperrt-Dauer)
      </p>
      <ul className="mt-4 space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm"
          >
            <span className="text-gray-300">
              {e.reward_title ?? "Unlock"} · {formatDate(e.start_at)}
              {e.end_at ? ` – ${formatDate(e.end_at)}` : e.duration_minutes ? ` (${e.duration_minutes} Min)` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
