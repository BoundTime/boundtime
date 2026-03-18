"use client";

import Link from "next/link";
import { useRestriction } from "@/lib/restriction-context";

export function RestrictionBanner() {
  const { isRestricted, isUnlocked, isLoading } = useRestriction();

  if (isLoading || !isRestricted || isUnlocked) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center">
      <p className="text-sm text-amber-200">
        <span className="font-medium text-amber-100">Cuckymode (Paar) aktiv.</span>{" "}
        <Link
          href="/dashboard/einstellungen"
          className="font-medium text-amber-100 underline hover:text-white"
        >
          Zu den Einstellungen – Cuckymode-Paarpasswort eingeben (zum Schreiben/Kommunizieren) oder Cuckymode aufheben
        </Link>
      </p>
    </div>
  );
}
