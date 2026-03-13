"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-amber-500/30 bg-amber-950/90 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-100">
            <strong>Der Bestätigungslink ist abgelaufen.</strong> Neue E-Mail anfordern oder zum Login, falls du bereits bestätigt hast.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg border border-amber-500/50 bg-amber-900/50 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-800/50"
            >
              Zum Login
            </Link>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="rounded-lg px-3 py-2 text-sm text-amber-200 hover:bg-amber-800/30"
              aria-label="Hinweis schließen"
            >
              Schließen
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail für neuen Bestätigungslink"
            className="rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-2 text-sm text-white placeholder-amber-300/60 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || !email.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Wird gesendet …" : "Neue Bestätigungs-E-Mail senden"}
          </button>
        </div>
        {message && <p className="text-xs text-amber-200">{message}</p>}
      </div>
    </div>
  );
}
