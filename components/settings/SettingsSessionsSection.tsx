"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SettingsSessionsSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signOutOthers() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "others" });
      setSuccess("Alle anderen Geräte wurden abgemeldet.");
    } catch (e) {
      setError("Fehler beim Abmelden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400">
        Du bist auf diesem Gerät angemeldet.
      </p>
      <button
        type="button"
        onClick={signOutOthers}
        disabled={loading}
        className="mt-4 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "…" : "Alle anderen Geräte abmelden"}
      </button>
      {success && <p className="mt-2 text-sm text-green-400">{success}</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
