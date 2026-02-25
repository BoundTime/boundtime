"use client";

import { useMemo } from "react";

type Task = {
  id: string;
  title: string;
  due_date: string;
  status: string;
  bound_dollars_on_completion: number;
};

export function ChastityCalendarList({ tasks }: { tasks: Task[] }) {
  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.due_date) ?? [];
      list.push(t);
      map.set(t.due_date, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [tasks]);

  if (tasks.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Kalender-Übersicht</h3>
      <p className="mt-1 text-sm text-gray-500">Aufgaben nach Frist</p>
      <ul className="mt-4 space-y-4">
        {byDate.map(([date, list]) => (
          <li key={date} className="rounded-lg border border-gray-700 p-3">
            <p className="text-sm font-medium text-accent">{date}</p>
            <ul className="mt-2 space-y-1">
              {list.map((t) => (
                <li key={t.id} className="text-sm text-gray-300">
                  {t.title} · {t.bound_dollars_on_completion} BD · {t.status}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
