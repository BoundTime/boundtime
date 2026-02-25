"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RewardTemplate = { id: string; title: string; description: string | null };

type ChastityStartFormProps = {
  initialSubId?: string | null;
  initialSubNick?: string | null;
};

export function ChastityStartForm({
  initialSubId,
  initialSubNick,
}: ChastityStartFormProps = {}) {
  const router = useRouter();
  const [rewardTemplates, setRewardTemplates] = useState<RewardTemplate[]>([]);
  const [subNick, setSubNick] = useState("");
  const [rewardGoalBoundDollars, setRewardGoalBoundDollars] = useState("100");
  const [rewardDescription, setRewardDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubNick != null) setSubNick(initialSubNick);
  }, [initialSubNick]);

  useEffect(() => {
    createClient()
      .from("chastity_reward_templates")
      .select("id, title, description")
      .order("sort_order")
      .then(({ data }) => setRewardTemplates(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const goal = parseInt(rewardGoalBoundDollars, 10);
    if (!goal || goal < 1) {
      setError("Bitte ein gültiges Belohnungsziel (BoundDollars) angeben.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    let subId: string;
    if (initialSubId) {
      subId = initialSubId;
    } else {
      if (!subNick.trim()) {
        setError("Bitte Nick angeben.");
        setLoading(false);
        return;
      }
      const { data: subProfile, error: lookupErr } = await supabase
        .from("profiles")
        .select("id")
        .ilike("nick", subNick.trim())
        .maybeSingle();
      if (lookupErr) {
        setError("Profil-Suche fehlgeschlagen. Bitte Nick prüfen.");
        setLoading(false);
        return;
      }
      if (!subProfile?.id) {
        setError("Kein Profil mit diesem Nick gefunden.");
        setLoading(false);
        return;
      }
      subId = subProfile.id;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setLoading(false);
      return;
    }
    const { data: existing } = await supabase
      .from("chastity_arrangements")
      .select("id")
      .eq("dom_id", user.id)
      .eq("sub_id", subId)
      .in("status", ["pending", "active", "paused"])
      .maybeSingle();
    if (existing) {
      setError("Mit diesem Sub existiert bereits eine offene Dynamik.");
      setLoading(false);
      return;
    }
    const { error: insertErr } = await supabase.from("chastity_arrangements").insert({
      dom_id: user.id,
      sub_id: subId,
      reward_goal_bound_dollars: goal,
      reward_description: rewardDescription.trim() || null,
      status: "pending",
    });
    if (insertErr) {
      setError(`Dynamik konnte nicht erstellt werden: ${insertErr.message}`);
      setLoading(false);
      return;
    }
    setSubNick("");
    setRewardGoalBoundDollars("100");
    setRewardDescription("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      {initialSubId && initialSubNick ? (
        <p className="text-sm text-gray-400">
          Dynamik mit <span className="font-medium text-white">{initialSubNick}</span> starten
        </p>
      ) : (
        <div>
          <label htmlFor="chastity-sub-nick" className="mb-1 block text-xs text-gray-500">
            Nick des Sub
          </label>
          <input
            id="chastity-sub-nick"
            type="text"
            value={subNick}
            onChange={(e) => setSubNick(e.target.value)}
            className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
            placeholder="z.B. Keuschling"
          />
        </div>
      )}
      <div>
        <label htmlFor="chastity-goal" className="mb-1 block text-xs text-gray-500">
          Belohnungsziel (BoundDollars)
        </label>
        <input
          id="chastity-goal"
          type="number"
          min={1}
          value={rewardGoalBoundDollars}
          onChange={(e) => setRewardGoalBoundDollars(e.target.value)}
          className="w-24 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="min-w-[200px] flex-1">
        <label htmlFor="chastity-reward" className="mb-1 block text-xs text-gray-500">
          Beschreibung der Belohnung (optional)
        </label>
        {rewardTemplates.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Schnellauswahl: </span>
            <div className="mt-1 flex flex-wrap gap-2">
            {rewardTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRewardDescription(t.title)}
                className="rounded-lg border border-gray-600 bg-background px-2 py-1 text-xs text-gray-400 hover:border-accent hover:text-accent"
              >
                {t.title}
              </button>
            ))}
            </div>
          </div>
        )}
        <input
          id="chastity-reward"
          type="text"
          value={rewardDescription}
          onChange={(e) => setRewardDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          placeholder="z.B. Eine Woche frei oder Vorlage anklicken"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Wird erstellt…" : "Anfrage senden"}
      </button>
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
