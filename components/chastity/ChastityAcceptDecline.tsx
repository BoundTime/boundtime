"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityAcceptDecline({ arrangementId }: { arrangementId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function accept() {
    setLoading("accept");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(null);
      return;
    }
    const { error } = await supabase
      .from("chastity_arrangements")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", arrangementId)
      .eq("sub_id", user.id);
    setLoading(null);
    if (error) {
      console.error("ChastityAcceptDecline accept error:", error);
      return;
    }
    router.refresh();
  }

  async function decline() {
    setLoading("decline");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(null);
      return;
    }
    const { error } = await supabase
      .from("chastity_arrangements")
      .update({ status: "ended", updated_at: new Date().toISOString() })
      .eq("id", arrangementId)
      .eq("sub_id", user.id);
    setLoading(null);
    if (error) {
      console.error("ChastityAcceptDecline decline error:", error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={accept}
        disabled={loading !== null}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "accept" ? "…" : "Annehmen"}
      </button>
      <button
        type="button"
        onClick={decline}
        disabled={loading !== null}
        className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
      >
        {loading === "decline" ? "…" : "Ablehnen"}
      </button>
    </div>
  );
}
