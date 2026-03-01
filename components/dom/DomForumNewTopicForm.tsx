"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DomForumNewTopicForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimTitle = title.trim();
    const trimContent = content.trim();
    if (!trimTitle) {
      setError("Bitte einen Themennamen eingeben.");
      return;
    }
    if (trimTitle.length < 3) {
      setError("Der Themenname muss mindestens 3 Zeichen haben.");
      return;
    }
    if (!trimContent) {
      setError("Bitte einen ersten Beitrag eingeben.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setLoading(false);
      return;
    }
    const { data: topic, error: topicErr } = await supabase
      .from("dom_forum_topics")
      .insert({ author_id: user.id, title: trimTitle })
      .select("id")
      .single();
    if (topicErr) {
      setError(topicErr.message);
      setLoading(false);
      return;
    }
    const { error: postErr } = await supabase
      .from("dom_forum_posts")
      .insert({ topic_id: topic.id, author_id: user.id, content: trimContent });
    if (postErr) {
      setError(postErr.message);
      setLoading(false);
      return;
    }
    setTitle("");
    setContent("");
    setLoading(false);
    router.push(`/dashboard/dom-bereich/${topic.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Themen-Titel (z.B. Tipps für Anfänger-Doms)"
        maxLength={200}
        className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Erster Beitrag / Diskussionsanstoß …"
        maxLength={2000}
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-600 bg-background px-4 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500">{content.length}/2000</span>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Wird erstellt …" : "Thema erstellen"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
