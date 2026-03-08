"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileRestriction = {
  account_type: string | null;
  restriction_enabled: boolean;
  restriction_recovery_email: string | null;
  has_restriction_password: boolean;
};

export function SettingsRestrictionSection() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRestriction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [profilesRes, restrictionRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("account_type, restriction_enabled, restriction_recovery_email")
        .eq("id", user.id)
        .single(),
      fetch("/api/me/restriction", { cache: "no-store", credentials: "same-origin" }).then((r) => r.json()),
    ]);
    const p = profilesRes.data;
    const restriction = restrictionRes as { hasPasswordSet?: boolean };
    if (p) {
      setProfile({
        account_type: p.account_type,
        restriction_enabled: p.restriction_enabled ?? false,
        restriction_recovery_email: p.restriction_recovery_email,
        has_restriction_password: restriction?.hasPasswordSet === true,
      });
      setRecoveryEmail(p.restriction_recovery_email ?? "");
      setEnabled(p.restriction_enabled ?? false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadProfile();
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    const supabase = createClient();
    const pwdTrim = password.trim();
    const isFall2 = profile?.restriction_enabled === true;
    try {
      if (isFall2 && !profile?.has_restriction_password && pwdTrim) {
        const repairRes = await fetch("/api/me/restriction/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ password: pwdTrim }),
        });
        const repairData = (await repairRes.json()) as { ok?: boolean; error?: string };
        if (!repairRes.ok || !repairData.ok) {
          setError(repairData.error ?? "Passwort konnte nicht gesetzt werden.");
          return;
        }
      }

      const { error: rpcError } = await supabase.rpc("set_restriction_password", {
        p_password: pwdTrim || null,
        p_recovery_email: recoveryEmail.trim() || null,
        p_enabled: enabled,
        p_current_password: isFall2
          ? (profile?.has_restriction_password ? currentPassword?.trim() || null : pwdTrim || null)
          : null,
      });
      if (rpcError) {
        const msg = rpcError.message ?? "Fehler beim Speichern.";
        if (
          typeof msg === "string" &&
          (msg.includes("Aktuelles Passwort") || msg.includes("Passwort ist falsch")) &&
          profile &&
          isFall2 &&
          !profile.has_restriction_password
        ) {
          setError(
            "Es ist noch kein Passwort hinterlegt. Bitte im Feld „Neues Passwort“ ein Passwort eintragen („Aktuelles Passwort“ leer lassen) und Speichern klicken."
          );
        } else {
          setError(msg);
        }
        return;
      }
      await fetch("/api/me/restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ restrictionEnabled: enabled }),
      });
      await loadProfile();
      const restrictionRes = await fetch("/api/me/restriction", { cache: "no-store", credentials: "same-origin" }).then((r) => r.json());
      const hasPasswordSetNow = (restrictionRes as { hasPasswordSet?: boolean }).hasPasswordSet === true;
      if (enabled && pwdTrim && !hasPasswordSetNow) {
        setError(
          "Passwort wurde nicht gespeichert. Bitte erneut versuchen oder Migration 072/073 anwenden."
        );
      } else {
        setSuccess(
          enabled
            ? "Gespeichert. Zugriffsbeschränkung ist jetzt aktiv – der Punkt in der Navbar wird rot."
            : "Gespeichert. Zugriffsbeschränkung ist aus – der Punkt in der Navbar wird grün."
        );
        setPassword("");
        setCurrentPassword("");
        router.refresh();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("bt-restriction-changed", { detail: { restrictionEnabled: enabled } }));
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) return null;
  if (profile.account_type !== "couple") return null;

  const isFirstTime = !profile.restriction_enabled;
  const isChanging = profile.restriction_enabled;

  const needPasswordToEnable = enabled && isFirstTime && !password.trim();
  const needCurrentPasswordToChange = isChanging && profile.has_restriction_password && !currentPassword.trim();
  const submitDisabled = saving || needPasswordToEnable || needCurrentPasswordToChange;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-white">Zugriffsbeschränkung – Schreiben nur mit Passwort</h3>
      <p className="text-sm text-gray-400">
        Wenn aktiv, kann dein Partner nur lesen; zum Schreiben muss das Passwort eingegeben werden. Punkt in der Navbar: Grün = aus, Rot = aktiv.
      </p>

      {/* Status: aktiv / nicht aktiv */}
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          profile.restriction_enabled
            ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
            : "border-gray-600 bg-gray-800/40 text-gray-300"
        }`}
        role="status"
      >
        {profile.restriction_enabled ? (
          <>Aktuell: Zugriffsbeschränkung ist <strong>aktiv</strong> – Schreiben nur mit Passwort.</>
        ) : (
          <>Aktuell: Zugriffsbeschränkung ist <strong>nicht aktiv</strong>.</>
        )}
      </div>

      {/* ========== Fall 1: Noch nicht aktiv – erstes Einrichten ========== */}
      {isFirstTime && (
        <>
          <p className="text-xs text-gray-500">
            Schritt 1: Passwort festlegen. Schritt 2: Optional Recovery-E-Mail. Schritt 3: Häkchen setzen und Speichern.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">Passwort festlegen</label>
            <p className="mb-2 text-xs text-gray-500">
              Nur du (z. B. Hotwife) kennst es. Dein Partner braucht es später zum Schreiben, wenn die Beschränkung aktiv ist.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort wählen"
              className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
              autoComplete="new-password"
            />
          </div>
        </>
      )}

      {/* ========== Fall 2: Bereits aktiv – Einstellungen ändern ========== */}
      {isChanging && (
        <>
          <p className="text-xs text-gray-500">
            Zum Ändern oder Ausschalten: Aktuelles Passwort eintragen. Neues Passwort nur, wenn du es ändern willst.
          </p>
          <div className="rounded-lg border border-gray-600 bg-gray-800/40 p-4 space-y-4">
            <h4 className="text-sm font-medium text-white">Einstellungen ändern</h4>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Aktuelles Passwort (zum Bestätigen – nur du kennst es)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Neues Passwort (leer lassen = Passwort bleibt wie es ist)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nur zum Ändern eintragen"
                className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
                autoComplete="new-password"
              />
            </div>
          </div>
        </>
      )}

      {/* Recovery-E-Mail (in beiden Fällen) */}
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

      {/* Checkbox */}
      <div className="space-y-1">
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
        {needPasswordToEnable && (
          <p className="text-xs text-amber-400">Bitte Passwort festlegen, um die Beschränkung zu aktivieren.</p>
        )}
        {needCurrentPasswordToChange && (
          <p className="text-xs text-amber-400">Bitte aktuelles Passwort eintragen, um etwas zu ändern.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={submitDisabled}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {saving ? "Wird gespeichert …" : "Speichern"}
      </button>
    </form>
  );
}
