"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { createClient } from "@/lib/supabase/client";

export default function PasswortNeuSetzenPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Bitte gib ein neues Passwort ein.");
      return;
    }
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      if (updateError.message.toLowerCase().includes("same password")) {
        setError("Das neue Passwort darf nicht identisch mit dem alten sein.");
      } else {
        setError("Fehler beim Speichern. Der Reset-Link könnte abgelaufen sein – bitte fordere einen neuen an.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <PublicPageHeader
          title="Neues Passwort festlegen"
          subtitle="Wähle ein sicheres Passwort mit mindestens 8 Zeichen."
        />
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5 rounded-[1.25rem] border border-amber-200/10 bg-black/50 p-7 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] backdrop-blur-xl sm:p-8"
        >
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-300">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-amber-400/45 bg-amber-950/40 px-4 py-3 font-semibold text-amber-50 transition-[transform,background-color,border-color] duration-200 hover:border-amber-300/55 hover:bg-amber-950/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Bitte warten …" : "Passwort speichern"}
          </button>
        </form>
      </div>
    </Container>
  );
}
