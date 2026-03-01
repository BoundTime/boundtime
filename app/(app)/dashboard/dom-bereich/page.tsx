import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { DomForumTopicList } from "@/components/dom/DomForumTopicList";
import { DomForumNewTopicForm } from "@/components/dom/DomForumNewTopicForm";
import { MessageSquarePlus } from "lucide-react";

export default async function DomBereichPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, verified")
    .eq("id", user.id)
    .single();

  const isDomOrSwitcher = myProfile?.role === "Dom" || myProfile?.role === "Switcher";
  const isVerified = myProfile?.verified ?? false;

  if (!isDomOrSwitcher || !isVerified) {
    return (
      <Container className="py-16">
        <div className="rounded-xl border border-gray-700 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <MessageSquarePlus className="h-8 w-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Dom(me)-Forum</h1>
          <p className="mt-4 text-gray-400">
            Dieser Bereich ist nur für verifizierte Mitglieder mit der Rolle Dom oder Switcher zugänglich.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Bitte verifiziere dein Konto und stelle sicher, dass deine Rolle Dom oder Switcher ist.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block text-accent hover:underline">
            ← Zurück zu MyBound
          </Link>
        </div>
      </Container>
    );
  }

  const { data: topics } = await supabase
    .from("dom_forum_topics")
    .select("id, title, author_id, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  const topicIds = (topics ?? []).map((t) => t.id);
  const authorIds = [...new Set((topics ?? []).map((t) => t.author_id))];
  let postCountByTopic: Record<string, number> = {};

  const [authorsRes, countsRes] = await Promise.all([
    authorIds.length > 0
      ? supabase.from("profiles").select("id, nick, avatar_url, avatar_photo_id").in("id", authorIds)
      : { data: [] },
    topicIds.length > 0
      ? supabase.from("dom_forum_posts").select("topic_id").in("topic_id", topicIds)
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
    <Container className="py-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <MessageSquarePlus className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dom(me)-Forum</h1>
              <p className="text-sm text-gray-500">Austausch & Diskussion unter verifizierten Dom(me)s</p>
            </div>
          </div>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
          ← MyBound
        </Link>
      </div>

      <div className="mb-8 rounded-xl border border-gray-700 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-300">Neues Thema erstellen</h2>
        <DomForumNewTopicForm />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Themen</h2>
        <DomForumTopicList topics={topicsWithCount} />
      </section>
    </Container>
  );
}
