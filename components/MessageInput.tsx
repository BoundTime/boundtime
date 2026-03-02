"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_CONTENT_MAX } from "@/types";
import { useRestriction } from "@/lib/restriction-context";

export function MessageInput({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { canWrite, requestUnlock } = useRestriction();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-Resize für das Eingabefeld
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 200);
    el.style.height = `${next}px`;
  }, [content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) {
      requestUnlock();
      return;
    }
    setError(null);
    const trimContent = content.trim();
    if (!trimContent) return;
    if (trimContent.length > POST_CONTENT_MAX) {
      setError(`Maximal ${POST_CONTENT_MAX} Zeichen.`);
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
    const { error: insertErr } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimContent,
    });
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={canWrite ? "Nachricht schreiben…" : "Passwort eingeben um zu schreiben"}
          maxLength={POST_CONTENT_MAX}
          className="max-h-[200px] w-full resize-none rounded-lg border border-gray-600 bg-background px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <button
        type="submit"
        disabled={loading || (canWrite && !content.trim())}
        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "…" : canWrite ? "Senden" : "Freischalten"}
      </button>
      {error && <p className="mt-2 w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
