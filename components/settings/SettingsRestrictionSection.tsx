"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RestrictionFlags = {
  noSingleFemaleProfiles: boolean;
  noMessages: boolean;
  noCoupleProfiles: boolean;
  noImages: boolean;
};

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
  const [changingPassword, setChangingPassword] = useState(false);
  const [noSingleFemaleProfiles, setNoSingleFemaleProfiles] = useState(false);
  const [noMessages, setNoMessages] = useState(false);
  const [noCoupleProfiles, setNoCoupleProfiles] = useState(false);
  const [noImages, setNoImages] = useState(false);

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
    const restriction = restrictionRes as { hasPasswordSet?: boolean; restrictionFlags?: RestrictionFlags };
    if (p) {
      setProfile({
        account_type: p.account_type,
        restriction_enabled: p.restriction_enabled ?? false,
        restriction_recovery_email: p.restriction_recovery_email,
        has_restriction_password: restriction?.hasPasswordSet === true,
      });
      setRecoveryEmail(p.restriction_recovery_email ?? "");
      setEnabled(p.restriction_enabled ?? false);
      const flags = restriction?.restrictionFlags;
      if (flags) {
        setNoSingleFemaleProfiles(flags.noSingleFemaleProfiles ?? false);
        setNoMessages(flags.noMessages ?? false);
        setNoCoupleProfiles(flags.noCoupleProfiles ?? false);
        setNoImages(flags.noImages ?? false);
      }
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
      // Beim ersten Aktivieren hat die DB nach set_restriction_password bereits Hash + enabled;
      // die Flags-API verlangt dann ein Passwort – dafür das gerade gesetzte Passwort mitschicken.
      const passwordForFlags =
        isFall2 && profile?.has_restriction_password
          ? currentPassword?.trim() || undefined
          : enabled && pwdTrim
            ? pwdTrim
            : undefined;
      const flagsRes = await fetch("/api/me/restriction/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          noSingleFemaleProfiles,
          noMessages,
          noCoupleProfiles,
          noImages,
          currentPassword: passwordForFlags,
        }),
      });
      if (!flagsRes.ok) {
        const flagsErr = (await flagsRes.json().catch(() => ({}))) as { error?: string };
        setError(flagsErr.error ?? "Einschränkungs-Optionen konnten nicht gespeichert werden.");
        return;
      }
      if (!enabled && profile) {
        setProfile((prev) => (prev ? { ...prev, restriction_enabled: false } : null));
        setEnabled(false);
      }
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
            ? "Gespeichert. Cuckymode ist jetzt aktiv – der Punkt in der Navbar wird rot."
            : "Cuckymode wurde aufgehoben. Der Punkt in der Navbar wird grün."
        );
        setPassword("");
        setCurrentPassword("");
        if (!enabled) {
          setProfile((prev) => (prev ? { ...prev, restriction_enabled: false } : null));
          setEnabled(false);
        }
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

  async function handleLiftRestriction() {
    const cur = currentPassword.trim();
    if (!cur) {
      setError("Bitte aktuelles Passwort eintragen, um Cuckymode aufzuheben.");
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);
    const supabase = createClient();
    try {
      const { error: rpcError } = await supabase.rpc("set_restriction_password", {
        p_password: null,
        p_recovery_email: null,
        p_enabled: false,
        p_current_password: cur,
      });
      if (rpcError) {
        setError(rpcError.message ?? "Cuckymode konnte nicht aufgehoben werden.");
        return;
      }
      await fetch("/api/me/restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ restrictionEnabled: false }),
      });
      setProfile((prev) => (prev ? { ...prev, restriction_enabled: false } : null));
      setEnabled(false);
      setCurrentPassword("");
      setSuccess("Cuckymode wurde aufgehoben. Der Punkt in der Navbar wird grün.");
      await loadProfile();
      setProfile((prev) => (prev ? { ...prev, restriction_enabled: false } : null));
      router.refresh();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bt-restriction-changed", { detail: { restrictionEnabled: false } }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Aufheben.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const cur = currentPassword.trim();
    const neu = password.trim();
    if (!cur || !neu) {
      setError("Bitte aktuelles und neues Passwort eintragen.");
      return;
    }
    setChangingPassword(true);
    const supabase = createClient();
    try {
      const { error: rpcError } = await supabase.rpc("set_restriction_password", {
        p_password: neu,
        p_recovery_email: null,
        p_enabled: true,
        p_current_password: cur,
      });
      if (rpcError) {
        setError(rpcError.message ?? "Passwort konnte nicht geändert werden.");
        return;
      }
      setSuccess("Passwort wurde geändert.");
      setPassword("");
      setCurrentPassword("");
      await loadProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Ändern.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading || !profile) return null;
  if (profile.account_type !== "couple") return null;

  const isFirstTime = !profile.restriction_enabled;
  const isChanging = profile.restriction_enabled;

  const needPasswordToEnable = enabled && isFirstTime && !password.trim();
  const needRecoveryEmailToEnable = enabled && isFirstTime && !recoveryEmail.trim();
  const needCurrentPasswordToChange = isChanging && profile.has_restriction_password && !currentPassword.trim();
  const submitDisabled = saving || needPasswordToEnable || needRecoveryEmailToEnable || needCurrentPasswordToChange;
  const changePasswordDisabled = changingPassword || !currentPassword.trim() || !password.trim();
  const liftRestrictionDisabled = saving || !currentPassword.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-white">Cuckymode – Schreiben nur mit Passwort</h3>
      <p className="text-sm text-gray-400">
        Nur du (z. B. Hotwife) kennst das Passwort; dein Partner braucht es zum Schreiben, wenn Cuckymode aktiv ist. Punkt in der Navbar: Grün = aus, Rot = aktiv.
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
          <>Aktuell: Cuckymode ist <strong>aktiv</strong> – Schreiben nur mit Passwort.</>
        ) : (
          <>Aktuell: Cuckymode ist <strong>nicht aktiv</strong>.</>
        )}
      </div>

      {/* ========== Fall 1: Noch nicht aktiv – erstes Einrichten ========== */}
      {isFirstTime && (
        <>
          <p className="text-xs text-gray-500">
            Schritt 1: Passwort festlegen. Schritt 2: Recovery-E-Mail für Passwort-Reset angeben. Schritt 3: Häkchen setzen und Speichern.
          </p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">Passwort festlegen</label>
            <p className="mb-2 text-xs text-gray-500">
              Nur du (z. B. Hotwife) kennst es. Dein Partner braucht es später zum Schreiben, wenn Cuckymode aktiv ist.
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
                Neues Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Neues Passwort eintragen"
                className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
                autoComplete="new-password"
              />
            </div>
            {profile.has_restriction_password && (
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changePasswordDisabled}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {changingPassword ? "Wird geändert …" : "Passwort ändern"}
              </button>
            )}
            <div className="pt-2 border-t border-gray-600">
              <button
                type="button"
                onClick={handleLiftRestriction}
                disabled={liftRestrictionDisabled}
                className="rounded-lg border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
              >
                {saving ? "Wird aufgehoben …" : "Cuckymode aufheben"}
              </button>
              <p className="mt-1 text-xs text-gray-500">Aktuelles Passwort eintragen und auf den Button klicken – Cuckymode ist dann aus.</p>
            </div>
          </div>
        </>
      )}

      {/* Recovery-E-Mail (in beiden Fällen; bei erster Vergabe Pflicht) */}
      <div>
        <label className="mb-1 block text-xs text-gray-500">
          {isFirstTime
            ? "Recovery-E-Mail (für Passwort-Reset erforderlich)"
            : "Recovery-E-Mail (optional, für Passwort-Reset)"}
        </label>
        <input
          type="email"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          placeholder="email@beispiel.de"
          className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>

      {/* Checkbox Cuckymode aktivieren */}
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
            Cuckymode aktivieren (Schreiben nur nach Passwort)
          </label>
        </div>
        {enabled && (
          <div className="ml-6 mt-3 space-y-2 rounded-lg border border-gray-600 bg-gray-800/30 p-3">
            <p className="text-xs font-medium text-gray-400">Zusätzliche Einschränkungen (was der Cucky nicht darf)</p>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={noSingleFemaleProfiles} onChange={(e) => setNoSingleFemaleProfiles(e.target.checked)} className="rounded border-gray-600 bg-background text-accent" />
              Keine Single-Frauen-Profile ansehen
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={noMessages} onChange={(e) => setNoMessages(e.target.checked)} className="rounded border-gray-600 bg-background text-accent" />
              Keine Nachrichten lesen oder schreiben
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={noCoupleProfiles} onChange={(e) => setNoCoupleProfiles(e.target.checked)} className="rounded border-gray-600 bg-background text-accent" />
              Keine Paar-Profile ansehen
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={noImages} onChange={(e) => setNoImages(e.target.checked)} className="rounded border-gray-600 bg-background text-accent" />
              Keine Bilder ansehen
            </label>
          </div>
        )}
        {needPasswordToEnable && (
          <p className="text-xs text-amber-400">Bitte Passwort festlegen, um Cuckymode zu aktivieren.</p>
        )}
        {needRecoveryEmailToEnable && (
          <p className="text-xs text-amber-400">Bitte Recovery-E-Mail angeben, um Cuckymode zu aktivieren.</p>
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
