"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function BlockButton({
  blockedId,
  initialBlocked,
}: {
  blockedId: string;
  initialBlocked: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === blockedId) return;
      if (blocked) {
        await supabase
          .from("blocked_users")
          .delete()
          .eq("blocker_id", user.id)
          .eq("blocked_id", blockedId);
        setBlocked(false);
      } else {
        await supabase.from("blocked_users").insert({
          blocker_id: user.id,
          blocked_id: blockedId,
        });
        setBlocked(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
    >
      {loading ? "…" : blocked ? "Entblockieren" : "Blockieren"}
    </button>
  );
}
