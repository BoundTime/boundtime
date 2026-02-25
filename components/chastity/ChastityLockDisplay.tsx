"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UnlockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChastityLockDuration } from "./ChastityLockDuration";

type ChastityLockDisplayProps = {
  arrangementId: string;
  lockedAt: string | null;
  isDom: boolean;
};

export function ChastityLockDisplay({
  arrangementId,
  lockedAt,
  isDom,
}: ChastityLockDisplayProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const locked = !!lockedAt;

  async function toggle() {
    if (!isDom || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("chastity_arrangements")
      .update({
        locked_at: locked ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", arrangementId);
    setLoading(false);
    if (!error) router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={isDom ? toggle : undefined}
        disabled={loading || !isDom}
        className={`flex flex-col items-center gap-1 transition-opacity ${
          isDom ? "cursor-pointer hover:opacity-80" : "cursor-default"
        } ${loading ? "opacity-50" : ""}`}
        title={isDom ? (locked ? "Klicken zum Öffnen" : "Klicken zum Sperren") : undefined}
      >
        {locked ? (
          <LockKeyhole
            className="h-12 w-12 shrink-0 text-accent"
            strokeWidth={1.5}
            aria-label="Schloss gesperrt"
          />
        ) : (
          <UnlockKeyhole
            className="h-12 w-12 shrink-0 text-gray-500"
            strokeWidth={1.5}
            aria-label="Schloss geöffnet"
          />
        )}
        <span className="text-xs text-gray-500">
          {locked ? "Gesperrt" : "Geöffnet"}
        </span>
      </button>
      {locked && lockedAt && (
        <div className="text-sm text-gray-300">
          <ChastityLockDuration lockedAt={lockedAt} arrangementId={arrangementId} />
        </div>
      )}
    </div>
  );
}
