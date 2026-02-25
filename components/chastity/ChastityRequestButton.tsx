"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityRequestButton({ domId }: { domId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setLoading(false);
      return;
    }
    const { data: existing } = await supabase
      .from("chastity_arrangements")
      .select("id")
      .eq("dom_id", domId)
      .eq("sub_id", user.id)
      .in("status", ["pending", "active", "paused", "requested_by_sub"])
      .maybeSingle();
    if (existing) {
      setError("Es existiert bereits eine offene Anfrage oder Dynamik.");
      setLoading(false);
      return;
    }
    const { error: insertErr } = await supabase.from("chastity_arrangements").insert({
      dom_id: domId,
      sub_id: user.id,
      reward_goal_bound_dollars: 0,
      reward_description: null,
      status: "requested_by_sub",
    });
    setLoading(false);
    if (insertErr) {
      setError(`Anfrage konnte nicht gesendet werden: ${insertErr.message}`);
      return;
    }
    router.push("/dashboard/keuschhaltung");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Wird gesendet…" : "Um Keuschhaltung bitten"}
      </button>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
