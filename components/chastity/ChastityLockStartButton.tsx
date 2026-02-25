"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityLockStartButton({ arrangementId }: { arrangementId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("chastity_arrangements")
      .update({ locked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", arrangementId);
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
    >
      {loading ? "…" : "Verschließen"}
    </button>
  );
}
