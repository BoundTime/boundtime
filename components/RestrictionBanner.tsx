"use client";

import { useRestriction } from "@/lib/restriction-context";

export function RestrictionBanner() {
  const { isRestricted, isUnlocked, isLoading, requestUnlock } = useRestriction();

  if (isLoading || !isRestricted || isUnlocked) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center">
      <p className="text-sm text-amber-200">
        Zugriff eingeschränkt.{" "}
        <button
          type="button"
          onClick={() => requestUnlock()}
          className="font-medium text-amber-100 underline hover:text-white"
        >
          Passwort eingeben, um Schreiben zu ermöglichen
        </button>
      </p>
    </div>
  );
}
