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
      <h3 className="text-base font-semibold text-white">Sitzungen absichern</h3>
      <p className="mt-1 text-sm text-gray-400">
        Was ist passiert? Du steuerst aktive Geraetezugriffe. Was bedeutet das? Alle fremden Sitzungen werden
        sofort beendet. Nächster Schritt: Andere Geraete gezielt abmelden.
      </p>
      <button
        type="button"
        onClick={signOutOthers}
        disabled={loading}
        className="mt-4 rounded-lg border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 transition-colors hover:bg-sky-500/20 disabled:opacity-50"
      >
        {loading ? "Wird durchgefuehrt ..." : "Alle anderen Geraete abmelden"}
      </button>
      {success && (
        <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
