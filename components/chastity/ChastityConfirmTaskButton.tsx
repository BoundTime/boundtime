"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityConfirmTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("confirm_chastity_task", {
      p_task_id: taskId,
      p_dom_comment: comment.trim() || null,
    });
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Lob/Kommentar (optional)"
        className="rounded border border-gray-600 bg-background px-2 py-1 text-sm text-white"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "…" : "Bestätigen & BD geben"}
      </button>
    </div>
  );
}
