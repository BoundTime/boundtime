"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityPenaltyButton({
  taskId,
  label = "Strafpunkte vergeben",
}: {
  taskId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("apply_chastity_penalty", {
      p_task_id: taskId,
    });
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
    >
      {loading ? "…" : label}
    </button>
  );
}
