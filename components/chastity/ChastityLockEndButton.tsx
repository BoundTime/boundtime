"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityLockEndButton({ arrangementId }: { arrangementId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("chastity_arrangements")
      .update({
        locked_at: null,
        status: "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("id", arrangementId);
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-red-500/60 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
    >
      {loading ? "…" : "Entschließen"}
    </button>
  );
}
