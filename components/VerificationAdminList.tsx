"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Verification = {
  id: string;
  user_id: string;
  photo_path: string;
  status: string;
  submitted_at: string;
  nick: string;
  photoUrl?: string | null;
};

const REJECTION_NOTE_MAX = 500;

export function VerificationAdminList({
  verifications,
  adminId,
}: {
  verifications: Verification[];
  adminId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (lightboxUrl) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxUrl]);

  useEffect(() => {
    if (!lightboxUrl) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxUrl(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  async function setStatus(id: string, status: "approved" | "rejected", note?: string) {
    setLoadingId(id);
    setError(null);
    const v = verifications.find((x) => x.id === id);
    if (!v) return;

    const updates: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    };
    if (status === "rejected" && note?.trim()) {
      updates.note = note.trim().slice(0, REJECTION_NOTE_MAX);
    }

    if (status === "approved") {
      const { error: rpcErr } = await supabase.rpc("approve_verification", {
        p_verification_id: id,
      });
      if (rpcErr) {
        setError(rpcErr.message);
        setLoadingId(null);
        return;
      }
    } else {
      await supabase
        .from("verifications")
        .update(updates)
        .eq("id", id);
    }

    setLoadingId(null);
    setRejectingId(null);
    setRejectionNote("");
    router.refresh();
  }

  function startReject(id: string) {
    setRejectingId(id);
    setRejectionNote("");
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectionNote("");
  }

  const pending = verifications.filter((v) => v.status === "pending");

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
      )}
      <h2 className="text-lg font-semibold text-white">
        Offene Anträge ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="text-sm text-gray-500">Keine offenen Verifizierungsanträge.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((v) => {
            const url = v.photoUrl ?? supabase.storage.from("verifications").getPublicUrl(v.photo_path).data.publicUrl;
            return (
              <li
                key={v.id}
                className="flex flex-wrap gap-4 rounded-lg border border-gray-700 bg-background p-4"
              >
                <button
                  type="button"
                  onClick={() => setLightboxUrl(url)}
                  className="shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-gray-600 transition-opacity hover:opacity-90"
                >
                  <img src={url} alt="Verifizierungsfoto vergrößern" className="h-32 w-auto object-contain" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{v.nick}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(v.submitted_at).toLocaleString("de-DE")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(v.id, "approved")}
                      disabled={loadingId === v.id}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Freigeben
                    </button>
                    <button
                      type="button"
                      onClick={() => startReject(v.id)}
                      disabled={loadingId === v.id}
                      className="rounded border border-red-600/50 px-3 py-1 text-sm text-red-400 hover:bg-red-950/30 disabled:opacity-50"
                    >
                      Ablehnen
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rejectingId &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Ablehnungsgrund angeben"
            onClick={(e) => e.target === e.currentTarget && cancelReject()}
          >
            <div
              className="w-full max-w-md rounded-xl border border-gray-700 bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">Verifizierung ablehnen</h3>
              <p className="mt-2 text-sm text-gray-400">
                Optional: Gib einen Grund an. Der Nutzer erhält diese Nachricht in seinem Postfach.
              </p>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value.slice(0, REJECTION_NOTE_MAX))}
                placeholder="z.B. Foto unscharf, Ausweis nicht lesbar..."
                rows={4}
                className="mt-4 w-full resize-none rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                maxLength={REJECTION_NOTE_MAX}
              />
              <p className="mt-1 text-xs text-gray-500">
                {rejectionNote.length}/{REJECTION_NOTE_MAX} Zeichen
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={cancelReject}
                  className="rounded border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(rejectingId, "rejected", rejectionNote)}
                  disabled={loadingId === rejectingId}
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Ablehnen
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {lightboxUrl &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-label="Verifizierungsfoto vergrößert"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Schließen"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={lightboxUrl}
              alt="Verifizierungsfoto"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
