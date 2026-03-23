"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "boundtime_cookie_consent";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted") setAccepted(true);
    } catch {
      // localStorage nicht verfügbar (z. B. privater Modus)
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignorieren
    }
    setAccepted(true);
  }

  if (!mounted || accepted) return null;

  return (
    <>
      {/* Reserviert Platz, damit fixierter Banner Footer/Inhalt nicht dauerhaft verdeckt */}
      <div className="h-32 w-full shrink-0 sm:h-[9.5rem]" aria-hidden />
      <div
        role="dialog"
        aria-label="Cookie-Hinweis"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-amber-200/10 bg-black/92 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_48px_-24px_rgba(0,0,0,0.75)] backdrop-blur-md md:px-6 md:pt-4"
      >
        <div className="mx-auto flex max-h-[38vh] max-w-6xl flex-col gap-3 overflow-y-auto px-4 sm:max-h-none sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:overflow-visible md:px-0">
          <p className="text-sm leading-relaxed text-gray-300">
            Wir nutzen technisch notwendige Cookies für Anmeldung und Sitzung (über Supabase),{" "}
            <strong className="font-medium text-gray-200">Vercel Web Analytics</strong> zur
            nutzungsbezogenen Auswertung (ohne werbliches Profiling; siehe Datenschutz) sowie ggf.{" "}
            <strong className="font-medium text-gray-200">Google Fonts</strong>. Zweck, Rechtsgrundlagen
            und Speicherdauer stehen in der{" "}
            <Link
              href="/datenschutz"
              className="font-medium text-amber-200/90 underline-offset-2 transition-colors hover:text-amber-100 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Datenschutzerklärung
            </Link>
            . Mit „Verstanden“ schließen Sie den Hinweis; die Auswahl wird lokal gespeichert.
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-3 pb-1 sm:pb-0">
            <Link
              href="/datenschutz"
              className="min-h-[44px] inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Mehr in Datenschutz
            </Link>
            <button
              type="button"
              onClick={handleAccept}
              className="min-h-[44px] rounded-xl border border-amber-400/35 bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
            >
              Verstanden
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
