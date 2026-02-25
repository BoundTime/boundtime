"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type UnlockEntry = { start_at: string; end_at: string | null; duration_minutes: number | null };

function formatDuration(effectiveMs: number): string {
  const diffMs = Math.max(0, effectiveMs);
  const sec = Math.floor(diffMs / 1000) % 60;
  const min = Math.floor(diffMs / 60000) % 60;
  const hours = Math.floor(diffMs / 3600000) % 24;
  const days = Math.floor(diffMs / 86400000) % 30;
  const months = Math.floor(diffMs / (86400000 * 30));
  const parts: string[] = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? "Monat" : "Monaten"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "Tag" : "Tagen"}`);
  parts.push(`${hours} ${hours === 1 ? "Stunde" : "Stunden"}`);
  parts.push(`${min} ${min === 1 ? "Minute" : "Minuten"}`);
  parts.push(`${sec} ${sec === 1 ? "Sekunde" : "Sekunden"}`);
  return "Effektiv gesperrt: " + parts.join(", ");
}

function totalUnlockMs(entries: UnlockEntry[], now: number): number {
  let total = 0;
  for (const e of entries) {
    if (e.end_at) {
      total += new Date(e.end_at).getTime() - new Date(e.start_at).getTime();
    } else if (e.duration_minutes != null) {
      total += e.duration_minutes * 60 * 1000;
    } else {
      total += now - new Date(e.start_at).getTime();
    }
  }
  return total;
}

export function ChastityLockDuration({
  lockedAt,
  arrangementId,
}: {
  lockedAt: string | null;
  arrangementId?: string;
}) {
  const [duration, setDuration] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [unlockEntries, setUnlockEntries] = useState<UnlockEntry[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (arrangementId) {
      createClient()
        .from("chastity_unlock_log")
        .select("start_at, end_at, duration_minutes")
        .eq("arrangement_id", arrangementId)
        .then(({ data }) => setUnlockEntries(data ?? []));
    }
  }, [arrangementId]);

  useEffect(() => {
    if (!lockedAt) {
      setDuration("—");
      return;
    }
    const tick = () => {
      const now = Date.now();
      const start = new Date(lockedAt).getTime();
      const unlockMs = totalUnlockMs(unlockEntries, now);
      const effectiveMs = now - start - unlockMs;
      setDuration(formatDuration(effectiveMs));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lockedAt, unlockEntries, mounted]);

  if (!mounted) return <span className="text-gray-400">—</span>;
  return <span className="text-gray-300 tabular-nums">{duration}</span>;
}
