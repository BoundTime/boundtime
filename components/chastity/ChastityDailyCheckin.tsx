"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MOOD_EMOJI: Record<number, string> = { 1: "😔", 2: "😐", 3: "🙂", 4: "😊", 5: "😍" };

export function ChastityDailyCheckin({
  arrangementId,
  subId,
  isSub,
}: {
  arrangementId: string;
  subId: string;
  isSub: boolean;
}) {
  const router = useRouter();
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!isSub) return;
    createClient()
      .from("chastity_daily_checkins")
      .select("mood_value, notes")
      .eq("arrangement_id", arrangementId)
      .eq("sub_id", subId)
      .eq("checkin_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMood(data.mood_value);
          setNotes(data.notes ?? "");
        }
      });
  }, [arrangementId, subId, today, isSub]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("chastity_daily_checkins")
      .upsert(
        {
          arrangement_id: arrangementId,
          sub_id: subId,
          checkin_date: today,
          mood_value: mood ?? null,
          notes: notes.trim() || null,
        },
        { onConflict: "arrangement_id,sub_id,checkin_date" }
      );
    setLoading(false);
    router.refresh();
  }

  if (!isSub) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Täglicher Check-in</h3>
      <p className="mt-1 text-sm text-gray-500">Stimmung und kurzer Bericht für heute</p>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Stimmung (1–5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(n)}
                className={`rounded-lg px-3 py-2 text-lg transition ${
                  mood === n ? "bg-accent text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                title={MOOD_EMOJI[n]}
              >
                {MOOD_EMOJI[n]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Notizen (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kurzer Bericht..."
            rows={2}
            className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "…" : "Speichern"}
        </button>
      </form>
    </div>
  );
}
