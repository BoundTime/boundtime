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
    <div
      role="dialog"
      aria-label="Cookie-Hinweis"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-700 bg-card/98 backdrop-blur px-4 py-4 shadow-lg md:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-300">
          Wir nutzen Cookies und Dienste (Session-Cookies für die Anmeldung, Supabase für Datenbank
          und Auth, ggf. Google Fonts für Schriften), um die Plattform bereitzustellen. Durch
          Klick auf „Akzeptieren“ willigen Sie in die Verwendung ein. Details finden Sie in unserer{" "}
          <Link href="/datenschutz" className="text-accent hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/datenschutz"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Mehr in Datenschutz
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
