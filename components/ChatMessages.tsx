"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, CheckCheck } from "lucide-react";

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

export function ChatMessages({
  messages,
  conversationId,
  userId,
  nickById,
}: {
  messages: Message[];
  conversationId: string;
  userId: string;
  nickById: Record<string, string | null>;
}) {
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
    ).then(() => {});
  }, [messages, userId]);

  return (
    <div className="min-h-[200px] flex-1 overflow-y-auto p-4 space-y-4">
      {!messages?.length ? (
        <p className="text-center text-sm text-gray-500">Noch keine Nachrichten.</p>
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
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  isOwn
                    ? "bg-accent text-white"
                    : "border border-gray-600 bg-background text-gray-200"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs font-medium text-accent">
                    {nickById[m.sender_id] ?? "?"}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <div className="mt-1 flex items-center gap-1.5">
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
    </div>
  );
}
