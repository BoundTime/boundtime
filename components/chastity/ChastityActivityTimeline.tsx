"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  happened_at: string;
  activity_type: string;
  title: string;
  bound_dollars: number | null;
};

const TYPE_LABELS: Record<string, string> = {
  task_completed: "Aufgabe erledigt",
  reward_approved: "Belohnung",
  unlock: "Unlock",
};

export function ChastityActivityTimeline({ arrangementId }: { arrangementId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    createClient()
      .from("chastity_activity_view")
      .select("happened_at, activity_type, title, bound_dollars")
      .eq("arrangement_id", arrangementId)
      .order("happened_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setActivities(data ?? []));
  }, [arrangementId]);

  if (activities.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Timeline</h3>
      <p className="mt-1 text-sm text-gray-500">Chronologische Aktivitäten</p>
      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {activities.map((a, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm"
          >
            <span className="text-gray-400">
              {new Date(a.happened_at).toLocaleString("de-DE")}
            </span>
            <span className="text-gray-300">
              {TYPE_LABELS[a.activity_type] ?? a.activity_type}: {a.title}
            </span>
            {a.bound_dollars != null && (
              <span
                className={
                  a.bound_dollars >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {a.bound_dollars >= 0 ? "+" : ""}
                {a.bound_dollars} BD
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
