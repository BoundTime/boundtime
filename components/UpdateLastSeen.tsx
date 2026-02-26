"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const INTERVAL_MS = 60_000;

export function UpdateLastSeen() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function update() {
      if (document.visibilityState !== "visible") return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.rpc("update_last_seen");
    }

    void update();
    intervalRef.current = setInterval(update, INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void update();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
