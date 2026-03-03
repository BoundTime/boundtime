"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Dispute = {
  id: string;
  bull_rating_id: string;
  bull_id: string;
  reason_text: string;
  created_at: string;
  status: string;
  rating: number | null;
  comment: string | null;
  raterNick: string;
  bullNick: string;
};

export function BullDisputesList({ disputes }: { disputes: Dispute[] }) {
  const [localDisputes, setLocalDisputes] = useState(disputes);

  async function setStatus(id: string, status: "resolved_rejected" | "resolved_upheld") {
    const supabase = createClient();
    await supabase.from("bull_rating_disputes").update({ status }).eq("id", id);
    setLocalDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  const pending = localDisputes.filter((d) => d.status === "pending");
  const resolved = localDisputes.filter((d) => d.status !== "pending");

  return (
    <div className="mt-6 space-y-6">
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white">Offen ({pending.length})</h2>
          <ul className="mt-3 space-y-4">
            {pending.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                  <span>Bull: {d.bullNick}</span>
                  <Link
                    href={`/dashboard/entdecken/${d.bull_id}`}
                    className="text-accent hover:underline"
                  >
                    Profil ansehen
                  </Link>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Bewertung: {d.rating != null && `${d.rating} ★`} {d.comment && `· „${d.comment.slice(0, 80)}${d.comment.length > 80 ? "…" : ""}"`}
                </p>
                <p className="mt-2 text-sm text-white">
                  <strong>Begründung des Bulls:</strong> {d.reason_text}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(d.created_at).toLocaleString("de-DE")}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(d.id, "resolved_rejected")}
                    className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
                  >
                    Beanstandung ablehnen
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(d.id, "resolved_upheld")}
                    className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-500"
                  >
                    Beanstandung stattgeben
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-400">Erledigt</h2>
          <ul className="mt-3 space-y-2">
            {resolved.map((d) => (
              <li key={d.id} className="rounded border border-gray-700 bg-background/50 p-3 text-sm text-gray-300">
                {d.bullNick} · {d.reason_text.slice(0, 60)}… ·{" "}
                <span className={d.status === "resolved_upheld" ? "text-amber-400" : "text-gray-500"}>
                  {d.status === "resolved_upheld" ? "Stattgegeben" : "Abgelehnt"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {localDisputes.length === 0 && (
        <p className="text-sm text-gray-500">Keine Beanstandungen.</p>
      )}
    </div>
  );
}
