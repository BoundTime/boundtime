"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EndConnectionButton({
  connectionId,
  isSub,
}: {
  connectionId: string;
  isSub: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmText = isSub
    ? "Wirklich trennen? Dadurch wird die Keuschhaltung beendet und du wirst entsperrt."
    : "Wirklich trennen? Dadurch wird die Keuschhaltung beendet und der Sub wird entsperrt.";

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("end_connection", { p_connection_id: connectionId });
    setLoading(false);
    setShowConfirm(false);
    if (!error) {
      router.push("/dashboard/keuschhaltung");
      setTimeout(() => router.refresh(), 50);
    } else {
      alert(error.message);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
      >
        Verbindung trennen
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-md rounded-xl border border-gray-700 bg-card p-6 shadow-xl">
            <p className="text-gray-300">{confirmText}</p>
            <p className="mt-2 text-sm text-gray-500">
              Deine BoundDollars bleiben beim Sub und werden auf sein Profil-Konto übertragen.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "…" : "Ja, trennen"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
