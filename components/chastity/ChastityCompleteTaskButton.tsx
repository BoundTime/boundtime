"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityCompleteTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function complete() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("complete_chastity_task", {
      p_task_id: taskId,
    });
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={complete}
      disabled={loading}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? "…" : "Als erledigt markieren"}
    </button>
  );
}
