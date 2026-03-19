"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Check, CheckCheck, X } from "lucide-react";

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

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
};

type Attachment = {
  id: string;
  file_path: string;
  filename: string;
  mime_type: string;
};

export function ChatMessages({
  messages,
  conversationId,
  userId,
  nickById,
  attachmentsByMessageId = {},
}: {
  messages: Message[];
  conversationId: string;
  userId: string;
  nickById: Record<string, string | null>;
  attachmentsByMessageId?: Record<string, Attachment[]>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (lightboxUrl) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxUrl]);

  useEffect(() => {
    if (!lightboxUrl) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxUrl(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxUrl]);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const toMark = messages.filter(
      (m) => m.sender_id !== userId && (m.delivered_at == null || m.read_at == null)
    );
    if (toMark.length === 0) return;

    const now = new Date().toISOString();
    Promise.all(
      toMark.map((m) =>
        supabase
          .from("messages")
          .update({
            delivered_at: m.delivered_at ?? now,
            read_at: m.read_at ?? now,
          })
          .eq("id", m.id)
      )
    ).then(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("messages-read"));
      }
    });
  }, [messages, userId]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_45%)] p-4">
      {!messages?.length ? (
        <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-gray-400">
          Diese Unterhaltung ist bereit. Schreibe die erste Nachricht in ruhigem, klarem Ton.
        </div>
      ) : (
        messages.map((m) => {
          const isOwn = m.sender_id === userId;
          const status = isOwn
            ? m.read_at
              ? "read"
              : m.delivered_at
                ? "delivered"
                : "sent"
            : null;
          return (
            <div
              key={m.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.9)] ${
                  isOwn
                    ? "border border-accent/40 bg-accent/90 text-white"
                    : "border border-gray-600 bg-background text-gray-200"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-medium text-amber-200">
                    {nickById[m.sender_id] ?? "?"}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>

                {/* Anhänge */}
                {attachmentsByMessageId[m.id]?.length ? (
                  <div className="mt-2 space-y-2">
                    {attachmentsByMessageId[m.id].map((att) => {
                      const publicUrl =
                        supabase.storage.from("message-attachments").getPublicUrl(att.file_path)
                          .data.publicUrl;
                      const isImage = att.mime_type.startsWith("image/");
                      return (
                        <div key={att.id}>
                          {isImage ? (
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(publicUrl)}
                              className="block text-left"
                            >
                              <img
                                src={publicUrl}
                                alt={att.filename}
                                className="max-h-48 w-full max-w-sm cursor-pointer rounded-lg border border-white/15 object-cover"
                              />
                            </button>
                          ) : (
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-gray-100 hover:bg-white/10"
                            >
                              {att.filename}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <p className={`text-xs ${isOwn ? "text-white/80" : "text-gray-500"}`}>
                    {formatTime(new Date(m.created_at))}
                  </p>
                  {isOwn && status && (
                    <span
                      className="flex shrink-0"
                      title={
                        status === "read"
                          ? "Gelesen"
                          : status === "delivered"
                            ? "Zugestellt"
                            : "Gesendet"
                      }
                    >
                      {status === "read" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-blue-300" strokeWidth={2.5} />
                      ) : status === "delivered" ? (
                        <CheckCheck className="h-3.5 w-3.5 opacity-90" strokeWidth={2.5} />
                      ) : (
                        <Check className="h-3.5 w-3.5 opacity-80" strokeWidth={2.5} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      {lightboxUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Foto vergrößern"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Schließen"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
