"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_CONTENT_MAX } from "@/types";
import { useRestriction } from "@/lib/restriction-context";

export function MessageInput({
  conversationId,
  bullNeedsVerification = false,
  oneMessageOnlyReached = false,
  unverifiedManLimitReached = false,
}: {
  conversationId: string;
  bullNeedsVerification?: boolean;
  oneMessageOnlyReached?: boolean;
  unverifiedManLimitReached?: boolean;
}) {
  const router = useRouter();
  const { canWrite, requestUnlock } = useRestriction();
  const canSend = canWrite && !oneMessageOnlyReached && !unverifiedManLimitReached;
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;
    const selected = Array.from(list);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) {
      requestUnlock();
      return;
    }
    if (!canSend) return;
    setError(null);
    const trimContent = content.trim();
    // Aktuell: Inhalt bleibt Pflicht (DB-Constraint). Anhänge sind optional.
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
    const { data: inserted, error: insertErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimContent,
      })
      .select("id")
      .single();
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }

    // Anhänge hochladen (sofern vorhanden)
    if (inserted && files.length > 0) {
      const uploads: Array<{ file_path: string; filename: string; mime_type: string }> = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "bin";
        const safeName = file.name.replace(/\s+/g, "_");
        const key = typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const path = `${conversationId}/${key}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("message-attachments")
          .upload(path, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
        if (!upErr) {
          uploads.push({
            file_path: path,
            filename: file.name,
            mime_type: file.type || "application/octet-stream",
          });
        }
      }
      if (uploads.length > 0) {
        await supabase
          .from("message_attachments")
          .insert(
            uploads.map((u) => ({
              message_id: inserted.id,
              ...u,
            })),
          );
      }
    }

    setContent("");
    setFiles([]);
    router.refresh();
  }

  const placeholderDisabled =
    bullNeedsVerification
      ? "Verifizierung nötig, um Nachrichten zu senden."
      : oneMessageOnlyReached
        ? "Du kannst nur eine Nachricht senden, bis ihr verbunden seid."
        : unverifiedManLimitReached
          ? "Du kannst als nicht verifizierter Mann nur eine Nachricht pro Tag senden."
          : !canWrite
            ? "Passwort eingeben zum Freischalten (Cuckymode)."
            : "Nachricht schreiben…";

  const placeholder = !canSend ? placeholderDisabled : "Nachricht schreiben…";

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1 min-w-0">
        <textarea
          ref={textareaRef}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={POST_CONTENT_MAX}
          readOnly={!canSend}
          aria-label="Nachricht eingeben"
          className={`min-h-[88px] max-h-[200px] w-full resize-none rounded-lg border border-gray-600 bg-background px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${!canSend ? "cursor-default opacity-90" : ""}`}
        />
        <div className="flex items-center justify-between gap-3">
          <label className={`inline-flex items-center gap-2 text-xs text-gray-400 ${canSend ? "cursor-pointer hover:text-gray-200" : "cursor-not-allowed opacity-70"}`}>
            <span className="rounded border border-gray-600 px-2 py-1 text-[11px] uppercase tracking-wide">
              Anhang
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFilesChange}
              disabled={!canSend}
              className="hidden"
            />
          </label>
          {files.length > 0 && canSend && (
            <p className="text-xs text-gray-500">
              {files.length} Anhang{files.length > 1 ? "e" : ""} ausgewählt
            </p>
          )}
        </div>
        {(bullNeedsVerification || unverifiedManLimitReached) && (
          <p className="text-xs text-gray-400">
            {canSend ? (
              <>Du kannst heute noch eine Nachricht senden.{" "}
                <Link href="/dashboard/verifizierung" className="text-accent hover:underline">
                  Zur Verifizierung
                </Link>
                {" "}(dann unbegrenzt schreiben).</>
            ) : (
              <>Verifiziere dich, um unbegrenzt Nachrichten zu senden.{" "}
                <Link href="/dashboard/verifizierung" className="text-accent hover:underline">
                  Zur Verifizierung →
                </Link>
              </>
            )}
          </p>
        )}
        {!canSend && !bullNeedsVerification && !unverifiedManLimitReached && (
          <p className="text-xs text-gray-400">
            {!canWrite && (
              <span>Passwort in den Einstellungen eingeben, um Nachrichten freizuschalten.</span>
            )}
            {oneMessageOnlyReached && canWrite && (
              <span>Folge der Person und bitte sie, dir zurückzufolgen – dann könnt ihr uneingeschränkt schreiben.</span>
            )}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !canSend || (canWrite && !content.trim())}
        className="shrink-0 self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "…" : canSend ? "Senden" : bullNeedsVerification || unverifiedManLimitReached ? "Verifizierung nötig" : canWrite ? "Senden" : "Freischalten"}
      </button>
      {error && <p className="mt-2 w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}
