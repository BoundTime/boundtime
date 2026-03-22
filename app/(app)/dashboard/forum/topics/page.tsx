import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { GeneralForumTopicList } from "@/components/forum/GeneralForumTopicList";
import { GeneralForumNewTopicForm } from "@/components/forum/GeneralForumNewTopicForm";
import { MessageSquare } from "lucide-react";

export default async function GeneralForumTopicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topics } = await supabase
    .from("forum_topics")
    .select("id, title, author_id, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(80);

  const topicIds = (topics ?? []).map((t) => t.id);
  const authorIds = Array.from(new Set((topics ?? []).map((t) => t.author_id)));
  let postCountByTopic: Record<string, number> = {};

  const [authorsRes, countsRes] = await Promise.all([
    authorIds.length > 0
      ? supabase.from("profiles").select("id, nick").in("id", authorIds)
      : { data: [] },
    topicIds.length > 0
      ? supabase.from("forum_posts").select("topic_id").in("topic_id", topicIds)
      : { data: [] },
  ]);

  for (const p of countsRes.data ?? []) {
    postCountByTopic[p.topic_id] = (postCountByTopic[p.topic_id] ?? 0) + 1;
  }
  const authorById = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));

  const topicsWithCount = (topics ?? []).map((t) => ({
    ...t,
    author_nick: authorById.get(t.author_id)?.nick ?? "?",
    post_count: postCountByTopic[t.id] ?? 0,
  }));

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/forum" className="mb-3 inline-block text-sm text-gray-400 hover:text-white">
            ← Forum-Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <MessageSquare className="h-6 w-6 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Allgemeines Forum</h1>
              <p className="text-sm text-gray-500">Diskussion für alle Mitglieder</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-gray-700 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Neues Thema</h2>
        <GeneralForumNewTopicForm />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Themen</h2>
        <GeneralForumTopicList topics={topicsWithCount} />
      </section>
    </Container>
  );
}
