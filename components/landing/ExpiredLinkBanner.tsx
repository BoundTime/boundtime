"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, X } from "lucide-react";

const RESEND_MSG =
  "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt.";

/**
 * Zeigt eine Meldung, wenn der Nutzer mit abgelaufenem Bestätigungslink
 * (#error=access_denied&error_code=otp_expired) auf die Startseite geleitet wurde.
 */
export function ExpiredLinkBanner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code");
    const error = params.get("error");
    if (errorCode === "otp_expired" || (error === "access_denied" && params.get("error_description")?.includes("expired"))) {
      setShow(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  async function handleResend() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(data?.message ?? RESEND_MSG);
    } catch {
      setMessage("Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b-2 border-amber-600/50 bg-gray-900 px-4 py-4 shadow-xl sm:px-6 sm:py-5">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Der Bestätigungslink ist abgelaufen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300 sm:text-base">
              Der Link aus deiner E-Mail war nur begrenzt gültig. Du kannst hier eine neue Bestätigungs-E-Mail anfordern oder dich anmelden, falls du bereits bestätigt hast.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Hinweis schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="expired-banner-email" className="mb-1.5 block text-sm font-medium text-gray-300">
              E-Mail-Adresse für neuen Bestätigungslink
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden />
              <input
                id="expired-banner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-600 bg-gray-950 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-0.5">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || !email.trim()}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Wird gesendet …" : "Neue E-Mail senden"}
            </button>
            <Link
              href="/login"
              className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-gray-700 hover:text-white"
            >
              Zum Login
            </Link>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded bg-gray-800/80 px-3 py-2 text-sm text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
