"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityAcceptRequestForm({
  arrangementId,
  subNick,
}: {
  arrangementId: string;
  subNick: string;
}) {
  const router = useRouter();
  const [rewardGoalBoundDollars, setRewardGoalBoundDollars] = useState("100");
  const [rewardDescription, setRewardDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    const goal = parseInt(rewardGoalBoundDollars, 10);
    if (!goal || goal < 1) {
      setError("Bitte ein gültiges Belohnungsziel angeben.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase
      .from("chastity_arrangements")
      .update({
        reward_goal_bound_dollars: goal,
        reward_description: rewardDescription.trim() || null,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", arrangementId);
    setLoading(false);
    if (updateErr) {
      setError(`Annahme fehlgeschlagen: ${updateErr.message}`);
      return;
    }
    router.refresh();
  }

  async function handleDecline() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("chastity_arrangements")
      .update({ status: "ended", updated_at: new Date().toISOString() })
      .eq("id", arrangementId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-700 bg-background p-4">
      <p className="text-sm text-gray-400">
        Belohnungsziel und Beschreibung festlegen, dann annehmen. Der Sub kann die Dynamik dann bestätigen.
      </p>
      <form onSubmit={handleAccept} className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Belohnungsziel (BoundDollars)</label>
          <input
            type="number"
            min={1}
            value={rewardGoalBoundDollars}
            onChange={(e) => setRewardGoalBoundDollars(e.target.value)}
            className="w-24 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs text-gray-500">Belohnung (optional)</label>
          <input
            type="text"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
            placeholder="z.B. Eine Woche frei"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Annehmen & Anfrage senden
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={loading}
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
        >
          Ablehnen
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
