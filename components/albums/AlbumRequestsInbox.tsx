"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RequestItem = {
  id: string;
  album_id: string;
  requester_id: string;
  status: string;
  created_at: string;
  album_name: string;
  requester_nick: string | null;
};

export function AlbumRequestsInbox({ requests }: { requests: RequestItem[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (requests.length === 0) return null;

  async function respond(requestId: string, status: "approved" | "rejected") {
    setLoadingId(requestId);
    const supabase = createClient();
    await supabase
      .from("album_view_requests")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", requestId);
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-white">Anfragen für Album-Zugriff</h2>
      <p className="mt-1 text-sm text-gray-400">
        Nutzer möchten eines deiner Alben ansehen. Bestätige oder lehne ab.
      </p>
      <ul className="mt-4 space-y-3">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-700 bg-background px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">
                {r.requester_nick ?? "?"} möchte Album „{r.album_name}“ ansehen
              </p>
              <p className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString("de-DE")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => respond(r.id, "approved")}
                disabled={loadingId === r.id}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Bestätigen
              </button>
              <button
                type="button"
                onClick={() => respond(r.id, "rejected")}
                disabled={loadingId === r.id}
                className="rounded-lg border border-red-600/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/30 disabled:opacity-50"
              >
                Ablehnen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
