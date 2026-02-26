"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SettingsAccountSection({
  email,
}: {
  email: string | undefined;
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
    if (deleteConfirm !== "LÖSCHEN") {
      setDeleteError('Bitte "LÖSCHEN" eintippen, um zu bestätigen.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Fehler beim Löschen.");
        return;
      }
      window.location.href = "/";
    } catch (e) {
      setDeleteError("Netzwerkfehler.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-card p-6">
      <h2 className="text-lg font-semibold text-white">Konto</h2>
      <p className="mt-1 text-sm text-gray-400">
        Angemeldet mit: <span className="text-white">{email ?? "—"}</span>
      </p>

      <div className="mt-6">
        <h3 className="text-base font-medium text-white">Passwort ändern</h3>
        <form onSubmit={handlePasswordChange} className="mt-2 space-y-2">
          <input
            type="password"
            name="newPassword"
            placeholder="Neues Passwort"
            className="w-full max-w-sm rounded-lg border border-gray-700 bg-background px-3 py-2 text-white placeholder-gray-500"
            required
            minLength={6}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Passwort bestätigen"
            className="w-full max-w-sm rounded-lg border border-gray-700 bg-background px-3 py-2 text-white placeholder-gray-500"
            required
          />
          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {pwLoading ? "…" : "Passwort ändern"}
          </button>
        </form>
        {pwSuccess && <p className="mt-2 text-sm text-green-400">{pwSuccess}</p>}
        {pwError && <p className="mt-2 text-sm text-red-400">{pwError}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Nach der Änderung können andere Sitzungen ungültig werden.
        </p>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-base font-medium text-red-400">Account löschen</h3>
        <p className="mt-1 text-sm text-gray-400">
          Aktion unwiderruflich – alle deine Daten werden gelöscht.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="LÖSCHEN eintippen"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
            className="w-full max-w-xs rounded-lg border border-gray-700 bg-background px-3 py-2 text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleAccountDelete}
            disabled={deleteLoading || deleteConfirm !== "LÖSCHEN"}
            className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleteLoading ? "…" : "Account endgültig löschen"}
          </button>
        </div>
        {deleteError && <p className="mt-2 text-sm text-red-400">{deleteError}</p>}
      </div>
    </div>
  );
}
