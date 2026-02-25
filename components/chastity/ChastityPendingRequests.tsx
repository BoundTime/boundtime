"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RequestRow = {
  id: string;
  catalog_item_id: string | null;
  requested_by: string;
  status: string;
  created_at: string;
  chastity_catalog_items?: {
    custom_title: string | null;
    price_bound_dollars: number;
    requires_unlock: boolean;
    chastity_reward_templates?: { title: string } | null;
  } | null;
  profiles?: { nick: string | null } | null;
};

export function ChastityPendingRequests({ arrangementId }: { arrangementId: string }) {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [declineComment, setDeclineComment] = useState("");
  const [approveData, setApproveData] = useState<{
    requestId: string;
    unlockStart: string;
    unlockEnd: string;
    duration: string;
    comment: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("chastity_reward_requests")
      .select(
        "id, catalog_item_id, requested_by, status, created_at, " +
          "chastity_catalog_items(custom_title, price_bound_dollars, requires_unlock, chastity_reward_templates(title)), " +
          "profiles!chastity_reward_requests_requested_by_fkey(nick)"
      )
      .eq("arrangement_id", arrangementId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRequests(data ?? []));
  }, [arrangementId]);

  async function approve(requestId: string) {
    setLoading(requestId);
    const supabase = createClient();
    const d = approveData?.requestId === requestId ? approveData : null;
    const { error } = await supabase.rpc("approve_reward_request", {
      p_request_id: requestId,
      p_comment: d?.comment || null,
      p_unlock_start: d?.unlockStart ? new Date(d.unlockStart).toISOString() : null,
      p_unlock_end: d?.unlockEnd ? new Date(d.unlockEnd).toISOString() : null,
      p_unlock_duration_minutes: d?.duration ? parseInt(d.duration, 10) : null,
    });
    setLoading(null);
    setApproveData(null);
    if (!error) router.refresh();
  }

  async function decline(requestId: string, comment?: string) {
    setLoading(requestId);
    const supabase = createClient();
    const { error } = await supabase.rpc("decline_reward_request", {
      p_request_id: requestId,
      p_comment: comment || null,
    });
    setLoading(null);
    setDeclineComment("");
    if (!error) router.refresh();
  }

  const displayTitle = (r: RequestRow) => {
    const c = r.chastity_catalog_items;
    if (!c) return "—";
    return (
      c.custom_title ??
      (c.chastity_reward_templates as { title?: string } | null)?.title ??
      "—"
    );
  };

  if (requests.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4">
      <h3 className="text-lg font-semibold text-amber-200">Belohnungsanfragen</h3>
      <ul className="mt-4 space-y-4">
        {requests.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-gray-700 bg-background p-4"
          >
            <p className="font-medium text-white">{displayTitle(r)}</p>
            <p className="text-sm text-gray-400">
              Von {r.profiles?.nick ?? "?"} · {r.chastity_catalog_items?.price_bound_dollars ?? 0} BD ·{" "}
              {new Date(r.created_at).toLocaleString("de-DE")}
            </p>
            {r.chastity_catalog_items?.requires_unlock && (
              <p className="mt-2 text-xs text-amber-400">
                Unlock erforderlich – Start/Ende oder Dauer angeben.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-end gap-3">
              {approveData?.requestId === r.id ? (
                <>
                  {r.chastity_catalog_items?.requires_unlock && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Unlock Start</label>
                        <input
                          type="datetime-local"
                          value={approveData.unlockStart}
                          onChange={(e) =>
                            setApproveData({ ...approveData, unlockStart: e.target.value })
                          }
                          className="rounded border border-gray-600 bg-background px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Unlock Ende</label>
                        <input
                          type="datetime-local"
                          value={approveData.unlockEnd}
                          onChange={(e) =>
                            setApproveData({ ...approveData, unlockEnd: e.target.value })
                          }
                          className="rounded border border-gray-600 bg-background px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Oder Dauer (Min)</label>
                        <input
                          type="number"
                          min={0}
                          value={approveData.duration}
                          onChange={(e) =>
                            setApproveData({ ...approveData, duration: e.target.value })
                          }
                          className="w-20 rounded border border-gray-600 bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Kommentar (optional)</label>
                    <input
                      type="text"
                      value={approveData.comment}
                      onChange={(e) =>
                        setApproveData({ ...approveData, comment: e.target.value })
                      }
                      className="rounded border border-gray-600 bg-background px-2 py-1 text-sm"
                      placeholder="z.B. Genieß es!"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => approve(r.id)}
                    disabled={loading !== null}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Genehmigen
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproveData(null)}
                    className="rounded border border-gray-600 px-4 py-2 text-sm text-gray-400"
                  >
                    Abbrechen
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setApproveData({
                        requestId: r.id,
                        unlockStart: new Date().toISOString().slice(0, 16),
                        unlockEnd: "",
                        duration: "",
                        comment: "",
                      })
                    }
                    disabled={loading !== null}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Genehmigen
                  </button>
                  <button
                    type="button"
                    onClick={() => decline(r.id, declineComment)}
                    disabled={loading !== null}
                    className="rounded-lg border border-red-600 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30"
                  >
                    Ablehnen
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
