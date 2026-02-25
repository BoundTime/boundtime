"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Zeichnet einen Profilbesuch auf (nur bei fremdem Profil).
 * Wartet auf die Session, bevor der RPC aufgerufen wird.
 */
export function RecordProfileView({
  profileId,
  viewerId,
}: {
  profileId: string;
  viewerId: string;
}) {
  useEffect(() => {
    if (profileId === viewerId) return;
    const supabase = createClient();

    async function record() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === profileId) return;
      const { error } = await supabase.rpc("record_profile_view", {
        target_profile_id: profileId,
      });
      if (error) console.warn("record_profile_view:", error.code, error.message);
    }

    record();
  }, [profileId, viewerId]);
  return null;
}
