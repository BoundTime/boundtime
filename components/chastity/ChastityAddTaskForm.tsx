"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TaskTemplate = {
  id: string;
  title: string;
  description: string | null;
  default_bound_dollars: number;
  default_penalty_bound_dollars: number | null;
};

export function ChastityAddTaskForm({
  arrangementId,
  domId,
}: {
  arrangementId: string;
  domId: string;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [boundDollars, setBoundDollars] = useState("10");
  const [penaltyBoundDollars, setPenaltyBoundDollars] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<"once" | "daily">("once");
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("chastity_task_templates")
      .select("id, title, description, default_bound_dollars, default_penalty_bound_dollars")
      .order("sort_order")
      .then(({ data }) => setTemplates(data ?? []));
  }, []);

  function applyTemplate(t: TaskTemplate) {
    setTitle(t.title);
    setDescription(t.description ?? "");
    setBoundDollars(String(t.default_bound_dollars));
    setPenaltyBoundDollars(
      t.default_penalty_bound_dollars != null ? String(t.default_penalty_bound_dollars) : null
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = parseInt(boundDollars, 10);
    if (!title.trim() || !dueDate || !p || p < 0) {
      setError("Titel, Frist und BoundDollars (≥ 0) angeben.");
      return;
    }
    const penalty = penaltyBoundDollars != null ? parseInt(penaltyBoundDollars, 10) : null;
    setLoading(true);
    const supabase = createClient();
    const { error: insertErr } = await supabase.from("chastity_tasks").insert({
      arrangement_id: arrangementId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate,
      bound_dollars_on_completion: p,
      penalty_bound_dollars: penalty ?? undefined,
      recurrence: recurrence,
      requires_photo: requiresPhoto,
      status: "pending",
      created_by: domId,
    });
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setTitle("");
    setDescription("");
    setDueDate("");
    setBoundDollars("10");
    setPenaltyBoundDollars(null);
    router.refresh();
  }

  return (
    <div className="mt-4">
      {templates.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs text-gray-500">Schnellauswahl (Vorlage anklicken)</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="rounded-lg border border-gray-600 bg-background px-3 py-1.5 text-sm text-gray-300 hover:border-accent hover:text-accent"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="task-title" className="mb-1 block text-xs text-gray-500">
          Titel
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          placeholder="z.B. Foto senden"
        />
      </div>
      <div>
        <label htmlFor="task-due" className="mb-1 block text-xs text-gray-500">
          Frist
        </label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={requiresPhoto}
          onChange={(e) => setRequiresPhoto(e.target.checked)}
          className="rounded border-gray-600"
        />
        <span className="text-xs text-gray-500">Foto-Beweis erforderlich</span>
      </label>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Wiederholung</label>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "once" | "daily")}
          className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        >
          <option value="once">Einmalig</option>
          <option value="daily">Täglich</option>
        </select>
      </div>
      <div>
        <label htmlFor="task-points" className="mb-1 block text-xs text-gray-500">
          BoundDollars (BD)
        </label>
        <input
          id="task-points"
          type="number"
          min={0}
          value={boundDollars}
          onChange={(e) => setBoundDollars(e.target.value)}
          className="w-20 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "…" : "Hinzufügen"}
      </button>
      <div className="w-full">
        <label htmlFor="task-desc" className="mb-1 block text-xs text-gray-500">
          Beschreibung (optional)
        </label>
        <input
          id="task-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          placeholder="Optionale Details"
        />
      </div>
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
    </div>
  );
}
