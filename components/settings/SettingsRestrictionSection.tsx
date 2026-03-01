"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileRestriction = {
  account_type: string | null;
  restriction_enabled: boolean;
  restriction_recovery_email: string | null;
  has_restriction_password: boolean;
};

export function SettingsRestrictionSection() {
  const [profile, setProfile] = useState<ProfileRestriction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("account_type, restriction_enabled, restriction_recovery_email")
        .eq("id", user.id)
        .single();
      if (p) {
        setProfile({
          account_type: p.account_type,
          restriction_enabled: p.restriction_enabled ?? false,
          restriction_recovery_email: p.restriction_recovery_email,
          has_restriction_password: p.restriction_enabled,
        });
        setRecoveryEmail(p.restriction_recovery_email ?? "");
        setEnabled(p.restriction_enabled ?? false);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    const supabase = createClient();
    try {
      await supabase.rpc("set_restriction_password", {
        p_password: password || null,
        p_recovery_email: recoveryEmail.trim() || null,
        p_enabled: enabled,
        p_current_password: profile?.restriction_enabled ? currentPassword || null : null,
      });
      setSuccess("Einstellungen gespeichert.");
      setPassword("");
      setCurrentPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) return null;
  if (profile.account_type !== "couple") return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-white">Zugriffsbeschränkung</h3>
      <p className="text-sm text-gray-400">
        Mit einem Restriction-Passwort kannst du den Schreibzugriff einschränken. Im eingeschränkten Modus
        können Nachrichten, Posts und Kommentare nur nach Passwort-Eingabe verfasst werden.
      </p>

      {profile.restriction_enabled && (
        <div>
          <label className="mb-1 block text-xs text-gray-500">Aktuelles Passwort (zum Ändern)</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs text-gray-500">Neues Restriction-Passwort {profile.has_restriction_password ? "(leer = unverändert)" : ""}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Recovery-E-Mail (optional, für Passwort-Reset)</label>
        <input
          type="email"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          placeholder="email@beispiel.de"
          className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="restriction-enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-gray-600 bg-background text-accent"
        />
        <label htmlFor="restriction-enabled" className="text-sm text-gray-300">
          Zugriff einschränken (Schreiben nur nach Passwort)
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={saving || (enabled && !profile.has_restriction_password && !password)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Wird gespeichert …" : "Speichern"}
      </button>
    </form>
  );
}
