"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RandomCheck = {
  id: string;
  requested_at: string;
  deadline_at: string;
  status: string;
  proof_photo_url: string | null;
};

export function ChastityRandomCheck({
  arrangementId,
  isDom,
}: {
  arrangementId: string;
  isDom: boolean;
}) {
  const router = useRouter();
  const [checks, setChecks] = useState<RandomCheck[]>([]);
  const [hours, setHours] = useState("4");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("expire_overdue_random_checks").then(() => {
      supabase
        .from("chastity_random_checks")
        .select("id, requested_at, deadline_at, status, proof_photo_url")
        .eq("arrangement_id", arrangementId)
        .order("requested_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setChecks(data ?? []));
    });
  }, [arrangementId, refreshKey]);

  async function deleteCheck(checkId: string) {
    const supabase = createClient();
    setChecks((prev) => prev.filter((c) => c.id !== checkId));
    const { error } = await supabase
      .from("chastity_random_checks")
      .delete()
      .eq("id", checkId)
      .eq("arrangement_id", arrangementId);
    if (error) {
      setRefreshKey((k) => k + 1);
      return;
    }
    router.refresh();
  }

  async function triggerCheck() {
    setLoading(true);
    const supabase = createClient();
    const h = Math.max(1, Math.min(72, parseInt(hours, 10) || 4));
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + h);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("chastity_random_checks").insert({
      arrangement_id: arrangementId,
      deadline_at: deadline.toISOString(),
      created_by: user.id,
    });
    setLoading(false);
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  const pendingForSub = checks.filter((c) => c.status === "pending" && isDom === false);
  const pendingForDom = checks.filter((c) => c.status === "pending" && isDom === true);

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Spontan-Check</h3>
      <p className="mt-1 text-sm text-gray-500">
        {isDom
          ? "Verlange einen unangekündigten Beweis vom Sub binnen X Stunden."
          : "Dom kann einen Beweis binnen Frist verlangen."}
      </p>

      {isDom && (
        <div className="mt-3 flex items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Frist (Stunden)</label>
            <input
              type="number"
              min={1}
              max={72}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-20 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="button"
            onClick={triggerCheck}
            disabled={loading}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "…" : "Spontan-Check auslösen"}
          </button>
        </div>
      )}

      {pendingForSub.length > 0 && (
        <ChastityRandomCheckProofUpload
          check={pendingForSub[0]}
          arrangementId={arrangementId}
          onDone={() => {
            setRefreshKey((k) => k + 1);
            router.refresh();
          }}
        />
      )}

      {checks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {checks.map((c) => (
            <li
              key={c.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                c.status === "pending"
                  ? "border-amber-600/50 bg-amber-950/30"
                  : c.status === "completed"
                    ? "border-green-600/30 bg-green-950/20"
                    : "border-gray-700 bg-gray-900/50"
              }`}
            >
              <span className="text-gray-400">
                {new Date(c.requested_at).toLocaleString("de-DE")} → Frist:{" "}
                {new Date(c.deadline_at).toLocaleString("de-DE")}
              </span>
              <span className="ml-2">
                {c.status === "pending" && "⏳ Ausstehend"}
                {c.status === "completed" && "✓ Erledigt"}
                {c.status === "failed" && "✗ Nicht erfüllt"}
              </span>
              {isDom && (
                <button
                  type="button"
                  onClick={() => deleteCheck(c.id)}
                  className="rounded border border-red-600/50 px-2 py-1 text-xs text-red-400 hover:bg-red-950/30"
                  title="Spontan-Check löschen"
                >
                  Löschen
                </button>
              )}
              {c.proof_photo_url && (
                <div className="mt-2 w-full">
                  <img
                    src={
                      createClient().storage
                        .from("task-proofs")
                        .getPublicUrl(c.proof_photo_url).data.publicUrl
                    }
                    alt="Beweis"
                    className="max-h-32 rounded object-cover"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChastityRandomCheckProofUpload({
  check,
  arrangementId,
  onDone,
}: {
  check: RandomCheck;
  arrangementId: string;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setLoading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${arrangementId}/random_${check.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("task-proofs")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setLoading(false);
      return;
    }
    await supabase
      .from("chastity_random_checks")
      .update({ proof_photo_url: path, status: "completed" })
      .eq("id", check.id);
    setLoading(false);
    onDone();
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-600/50 bg-amber-950/30 p-4">
      <p className="text-sm font-medium text-amber-200">Beweis erforderlich!</p>
      <p className="mt-1 text-xs text-gray-400">
        Frist: {new Date(check.deadline_at).toLocaleString("de-DE")}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-400"
        />
        <button
          type="button"
          onClick={upload}
          disabled={!file || loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "…" : "Hochladen"}
        </button>
      </div>
    </div>
  );
}
