"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityRequestButton({ domId }: { domId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOtherConnection, setHasOtherConnection] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setHasOtherConnection(false);
        return;
      }
      const { data } = await supabase
        .from("chastity_arrangements")
        .select("id")
        .eq("sub_id", user.id)
        .in("status", ["pending", "active", "paused", "requested_by_sub"])
        .limit(1);
      setHasOtherConnection((data?.length ?? 0) > 0);
    });
  }, []);

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
      .eq("sub_id", user.id)
      .in("status", ["pending", "active", "paused", "requested_by_sub"])
      .limit(1)
      .maybeSingle();
    if (existing) {
      setError("Du bist schon in einer Verbindung mit einem Dom.");
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

  if (hasOtherConnection) {
    return (
      <span className="text-sm text-gray-400">
        Du bist schon in einer Verbindung mit einem Dom.{" "}
        <a href="/dashboard/keuschhaltung" className="font-medium text-accent hover:text-accent-hover">
          Zur Keuschhaltung
        </a>
      </span>
    );
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
