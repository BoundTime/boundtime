"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function VerificationAdminList({
  verifications,
  adminId,
}: {
  verifications: Verification[];
  adminId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const supabase = createClient();

  async function setStatus(id: string, status: "approved" | "rejected") {
    setLoadingId(id);
    const v = verifications.find((x) => x.id === id);
    if (!v) return;

    await supabase
      .from("verifications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq("id", id);

    if (status === "approved") {
      await supabase.from("profiles").update({ verified: true, verification_tier: "gold" }).eq("id", v.user_id);
    }

    setLoadingId(null);
    router.refresh();
  }

  const pending = verifications.filter((v) => v.status === "pending");

  return (
    <div className="mt-6 space-y-4">
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
                <div className="shrink-0 overflow-hidden rounded-lg border border-gray-600">
                  <img src={url} alt="" className="h-32 w-auto object-contain" />
                </div>
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
                      onClick={() => setStatus(v.id, "rejected")}
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
    </div>
  );
}
