import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageInput } from "@/components/MessageInput";
import { ChatMessages } from "@/components/ChatMessages";
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

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, verified")
    .eq("id", user.id)
    .single();
  const bullNeedsVerification =
    myProfile?.role === "Bull" && !myProfile?.verified;

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
    .select("id, sender_id, content, created_at, delivered_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  // Anhänge zu den geladenen Nachrichten
  const messageIds = (messages ?? []).map((m) => m.id);
  let attachmentsByMessageId: Record<string, { id: string; file_path: string; filename: string; mime_type: string }[]> =
    {};
  if (messageIds.length) {
    const { data: attachments } = await supabase
      .from("message_attachments")
      .select("id, message_id, file_path, filename, mime_type")
      .in("message_id", messageIds);
    (attachments ?? []).forEach((att) => {
      const key = (att as { message_id: string }).message_id;
      if (!attachmentsByMessageId[key]) attachmentsByMessageId[key] = [];
      attachmentsByMessageId[key].push({
        id: att.id,
        file_path: att.file_path,
        filename: att.filename,
        mime_type: att.mime_type,
      });
    });
  }

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
          <Link
            href={`/dashboard/entdecken/${otherId}`}
            className="shrink-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full"
          >
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
          </Link>
          <Link href={`/dashboard/entdecken/${otherId}`} className="font-semibold text-white hover:text-accent">
            {otherNick}
          </Link>
        </div>

        <ChatMessages
          messages={messages ?? []}
          conversationId={id}
          userId={user.id}
          nickById={Object.fromEntries(nickById)}
          attachmentsByMessageId={attachmentsByMessageId}
        />

        <div className="shrink-0 border-t border-gray-700 p-4">
          <MessageInput conversationId={id} bullNeedsVerification={bullNeedsVerification} />
        </div>
      </div>
    </div>
  );
}
