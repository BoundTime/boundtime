import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { GeneralForumThread } from "@/components/forum/GeneralForumThread";
import { GeneralForumReplyForm } from "@/components/forum/GeneralForumReplyForm";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { MessageSquare } from "lucide-react";

export default async function GeneralForumTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: topicId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topic } = await supabase
    .from("forum_topics")
    .select("id, title, author_id, created_at")
    .eq("id", topicId)
    .single();

  if (!topic) notFound();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("id, author_id, content, image_url, created_at")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  const authorIds = Array.from(new Set([topic.author_id, ...(posts ?? []).map((p) => p.author_id)]));
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url, avatar_photo_id, verified")
    .in("id", authorIds);
  const authorById = new Map(authors?.map((a) => [a.id, a]) ?? []);

  const postsWithAuthor = await Promise.all(
    (posts ?? []).map(async (p) => {
      const a = authorById.get(p.author_id);
      const avatarUrl = a
        ? await resolveProfileAvatarUrl(
            { avatar_url: a.avatar_url, avatar_photo_id: a.avatar_photo_id },
            supabase
          )
        : null;
      return {
        ...p,
        author_nick: a?.nick ?? "?",
        author_avatar_url: avatarUrl,
        author_verified: a?.verified === true,
      };
    })
  );

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/forum/topics"
            className="flex items-center justify-center rounded-lg border border-gray-600 p-2 text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
            aria-label="Zurück zur Themenübersicht"
          >
            ←
          </Link>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20">
            <MessageSquare className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            <p className="text-xs text-gray-500">
              {postsWithAuthor.length} {postsWithAuthor.length === 1 ? "Beitrag" : "Beiträge"}
            </p>
          </div>
        </div>
        <Link href="/dashboard/forum/topics" className="text-sm text-gray-400 hover:text-white">
          Alle Themen
        </Link>
      </div>

      <GeneralForumThread posts={postsWithAuthor} currentUserId={user.id} />

      <div className="mt-8 rounded-xl border border-gray-700 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Antwort schreiben</h2>
        <GeneralForumReplyForm topicId={topicId} />
      </div>
    </Container>
  );
}
