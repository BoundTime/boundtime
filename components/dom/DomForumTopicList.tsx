"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

type Topic = {
  id: string;
  title: string;
  author_id: string;
  author_nick: string;
  created_at: string;
  updated_at: string;
  post_count: number;
};

export function DomForumTopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-600" />
        <p className="mt-4 text-gray-400">Noch keine Themen.</p>
        <p className="mt-1 text-sm text-gray-500">Erstelle das erste Thema oben im Formular.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {topics.map((topic) => (
        <li key={topic.id}>
          <Link
            href={`/dashboard/dom-bereich/${topic.id}`}
            className="flex items-center gap-4 rounded-xl border border-gray-700 bg-card p-4 transition-colors hover:border-gray-600 hover:bg-gray-800/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white truncate">{topic.title}</h3>
              <p className="text-xs text-gray-500">
                von {topic.author_nick} · {formatDate(topic.updated_at)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-xs text-gray-300">
                {topic.post_count} {topic.post_count === 1 ? "Beitrag" : "Beiträge"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return `heute ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return d.toLocaleDateString("de-DE");
}
