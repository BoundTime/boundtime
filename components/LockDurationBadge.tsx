"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function formatLockDuration(lockedAt: string): string {
  const start = new Date(lockedAt).getTime();
  const now = Date.now();
  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);

  if (diffDays > 0) {
    return diffHours > 0 ? `${diffDays}d ${diffHours}h` : `${diffDays} Tage`;
  }
  if (diffHours > 0) {
    return diffMins > 0 ? `${diffHours}h ${diffMins}m` : `${diffHours} Std`;
  }
  return `${diffMins} Min`;
}

export function LockDurationBadge({ onClick }: { onClick?: () => void }) {
  const [lockedAt, setLockedAt] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLockedAt(null);
        return;
      }
      supabase
        .from("chastity_arrangements")
        .select("id, locked_at")
        .eq("sub_id", user.id)
        .eq("status", "active")
        .not("locked_at", "is", null)
        .maybeSingle()
        .then(({ data }) => {
          setLockedAt(data?.locked_at ?? null);
        });
    });
  }, []);

  if (!lockedAt) return null;

  return (
    <Link
      href="/dashboard/keuschhaltung"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-amber-900/40 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-600/30 hover:bg-amber-900/60"
      title="Lock-Dauer"
    >
      <Lock className="h-3.5 w-3.5" strokeWidth={2} />
      <span>{formatLockDuration(lockedAt)}</span>
    </Link>
  );
}
