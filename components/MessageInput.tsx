"use client";

import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={canWrite ? "Nachricht schreiben…" : "Passwort eingeben um zu schreiben"}
        maxLength={POST_CONTENT_MAX}
        className="flex-1 rounded-lg border border-gray-600 bg-background px-4 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={loading || (canWrite && !content.trim())}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "…" : canWrite ? "Senden" : "Freischalten"}
      </button>
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
