"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SettingsAccountSection({
  email,
  dangerOnly = false,
}: {
  email: string | undefined;
  dangerOnly?: boolean;
}) {
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    const form = e.currentTarget;
    const newPw = (form.elements.namedItem("newPassword") as HTMLInputElement)?.value;
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value;
    if (!newPw || newPw.length < 6) {
      setPwError("Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    if (newPw !== confirm) {
      setPwError("Passwörter stimmen nicht überein.");
      return;
    }
    setPwLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        setPwError(error.message);
        return;
      }
      setPwSuccess("Passwort erfolgreich geändert.");
      form.reset();
    } finally {
      setPwLoading(false);
    }
  }

  async function handleAccountDelete() {
    if (deleteConfirm !== "LOESCHEN") {
      setDeleteError('Bitte "LOESCHEN" exakt eintippen, um fortzufahren.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Fehler beim Loeschen.");
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (e) {
      setDeleteError("Netzwerkfehler.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      {!dangerOnly && (
        <>
          <p className="text-sm text-gray-400">
            Angemeldet mit: <span className="font-medium text-white">{email ?? "—"}</span>
          </p>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 md:p-5">
            <h3 className="text-base font-semibold text-white">Passwort aktualisieren</h3>
            <p className="mt-1 text-sm text-gray-400">
              Lege ein neues Passwort fest und bestaetige es. Bestehende Sitzungen auf anderen Geraeten koennen dadurch
              beendet werden.
            </p>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <input
                type="password"
                name="newPassword"
                placeholder="Neues Passwort"
                className="w-full max-w-md rounded-lg border border-gray-700 bg-background px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                required
                minLength={6}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Passwort bestaetigen"
                className="w-full max-w-md rounded-lg border border-gray-700 bg-background px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                required
              />
              <button
                type="submit"
                disabled={pwLoading}
                className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {pwLoading ? "Wird gespeichert ..." : "Passwort speichern"}
              </button>
            </form>
            {pwSuccess && (
              <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {pwSuccess}
              </p>
            )}
            {pwError && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                Aenderungen konnten nicht gespeichert werden. {pwError}
              </p>
            )}
          </div>
        </>
      )}

      <div className={`${dangerOnly ? "" : "mt-8"} rounded-xl border border-red-500/35 bg-red-500/[0.08] p-4 md:p-5`}>
        <h3 className="text-base font-semibold text-red-200">Account endgueltig loeschen</h3>
        <p className="mt-1 text-sm text-red-100/90">
          Diese Aktion entfernt dein Profil dauerhaft. Inhalte und Historie koennen nicht wiederhergestellt werden.
          Tippe <span className="font-semibold">LOESCHEN</span> zur Bestaetigung ein.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="LOESCHEN eintippen"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
            className="w-full max-w-xs rounded-lg border border-red-500/35 bg-black/30 px-3 py-2 text-white placeholder-red-200/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30"
          />
          <button
            type="button"
            onClick={handleAccountDelete}
            disabled={deleteLoading || deleteConfirm !== "LOESCHEN"}
            className="rounded-lg border border-red-400/60 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteLoading ? "Wird geloescht ..." : "Account unwiderruflich loeschen"}
          </button>
        </div>
        {deleteError && (
          <p className="mt-3 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Loeschen nicht moeglich. {deleteError}
          </p>
        )}
      </div>
    </div>
  );
}
