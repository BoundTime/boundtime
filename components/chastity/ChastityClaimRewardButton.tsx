"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityClaimRewardButton({ arrangementId }: { arrangementId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("claim_chastity_reward", {
      p_arrangement_id: arrangementId,
    });
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={claim}
      disabled={loading}
      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
    >
      {loading ? "…" : "Belohnung abholen"}
    </button>
  );
}
