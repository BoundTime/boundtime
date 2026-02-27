import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageInput } from "@/components/MessageInput";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b")
    .eq("id", id)
    .single();
  if (!conv || (conv.participant_a !== user.id && conv.participant_b !== user.id)) {
    notFound();
  }

  const otherId = conv.participant_a === user.id ? conv.participant_b : conv.participant_a;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url, avatar_photo_id, verified")
    .eq("id", otherId)
    .single();
  const otherAvatarUrl = otherProfile
    ? await resolveProfileAvatarUrl(
        { avatar_url: otherProfile.avatar_url, avatar_photo_id: otherProfile.avatar_photo_id },
        supabase
      )
    : null;
  const otherNick = otherProfile?.nick ?? "?";
  const otherVerified = otherProfile?.verified ?? false;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const { data: senderProfiles } = await supabase
    .from("profiles")
    .select("id, nick")
    .in("id", Array.from(new Set((messages ?? []).map((m) => m.sender_id))));
  const nickById = new Map(senderProfiles?.map((p) => [p.id, p.nick]) ?? []);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-gray-700 bg-card md:border-t-0 md:border-l">
      <div className="shrink-0 p-4 md:hidden">
        <Link href="/dashboard/nachrichten" className="text-sm text-gray-400 hover:text-white">
          ← Nachrichten
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-4 border-b border-gray-700 p-4">
          <AvatarWithVerified verified={otherVerified} size="sm" className="h-10 w-10 shrink-0">
          <div className="h-full w-full overflow-hidden rounded-full border border-gray-700 bg-background">
            {otherAvatarUrl ? (
              <img src={otherAvatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                {(otherNick ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          </AvatarWithVerified>
          <h1 className="font-semibold text-white">{otherNick}</h1>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto p-4 space-y-4">
          {!messages?.length ? (
            <p className="text-center text-sm text-gray-500">Noch keine Nachrichten.</p>
          ) : (
            messages.map((m) => {
              const isOwn = m.sender_id === user.id;
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
                        {nickById.get(m.sender_id) ?? "?"}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`mt-1 text-xs ${isOwn ? "text-white/80" : "text-gray-500"}`}>
                      {formatTime(new Date(m.created_at))}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="shrink-0 border-t border-gray-700 p-4">
          <MessageInput conversationId={id} />
        </div>
      </div>
    </div>
  );
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
