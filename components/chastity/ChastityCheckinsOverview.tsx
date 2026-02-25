"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const MOOD_EMOJI: Record<number, string> = { 1: "😔", 2: "😐", 3: "🙂", 4: "😊", 5: "😍" };

type Checkin = {
  checkin_date: string;
  mood_value: number | null;
  notes: string | null;
  created_at: string;
};

export function ChastityCheckinsOverview({
  arrangementId,
}: {
  arrangementId: string;
}) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    createClient()
      .from("chastity_daily_checkins")
      .select("checkin_date, mood_value, notes, created_at")
      .eq("arrangement_id", arrangementId)
      .order("checkin_date", { ascending: false })
      .limit(14)
      .then(({ data }) => setCheckins(data ?? []));
  }, [arrangementId]);

  if (checkins.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Check-ins des Sub</h3>
      <p className="mt-1 text-sm text-gray-500">Letzte Einträge (Stimmung, Notizen)</p>
      <ul className="mt-3 space-y-2">
        {checkins.map((c) => (
          <li
            key={c.checkin_date}
            className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm"
          >
            <span className="text-gray-400">{c.checkin_date}</span>
            <span className="text-lg">
              {c.mood_value ? MOOD_EMOJI[c.mood_value] ?? "—" : "—"}
            </span>
            {c.notes && (
              <span className="max-w-[60%] truncate text-gray-300" title={c.notes}>
                {c.notes}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
