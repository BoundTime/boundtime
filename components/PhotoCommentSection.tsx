"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COMMENT_MAX = 500;

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { nick: string | null } | { nick: string | null }[] | null;
};

export function PhotoCommentSection({
  photoId,
  initialComments,
  initialCount,
}: {
  photoId: string;
  initialComments: Comment[];
  initialCount: number;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [count, setCount] = useState(initialCount);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function loadComments() {
    const supabase = createClient();
    const { data } = await supabase
      .from("photo_album_photo_comments")
      .select("id, user_id, content, created_at, profiles(nick)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    if (data) {
      setComments(data as Comment[]);
      setCount(data.length);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const trimContent = newContent.trim().slice(0, COMMENT_MAX);
    if (!trimContent) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("photo_album_photo_comments").insert({
      photo_id: photoId,
      user_id: user.id,
      content: trimContent,
    });
    setLoading(false);
    if (!error) {
      setNewContent("");
      setExpanded(true);
      router.refresh();
      loadComments();
    }
  }

  function formatTime(date: Date): string {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        aria-expanded={expanded}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
        <span>{count} {count === 1 ? "Kommentar" : "Kommentare"}</span>
      </button>

      {expanded && (
        <div className="space-y-3 rounded-lg border border-gray-600 bg-black/30 p-3">
          <ul className="max-h-32 space-y-2 overflow-y-auto text-sm">
            {comments.length === 0 ? (
              <li className="text-gray-500">Noch keine Kommentare.</li>
            ) : (
              comments.map((c) => (
                <li key={c.id} className="flex flex-col gap-0.5">
                  <span className="font-medium text-accent">
                    {(Array.isArray(c.profiles) ? c.profiles[0] : c.profiles)?.nick ?? "?"}
                  </span>
                  <p className="whitespace-pre-wrap break-words text-gray-200">{c.content}</p>
                  <span className="text-xs text-gray-500">{formatTime(new Date(c.created_at))}</span>
                </li>
              ))
            )}
          </ul>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value.slice(0, COMMENT_MAX))}
              placeholder="Kommentar schreiben…"
              maxLength={COMMENT_MAX}
              className="flex-1 rounded border border-gray-600 bg-black/40 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newContent.trim()}
              className="rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "…" : "Senden"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
