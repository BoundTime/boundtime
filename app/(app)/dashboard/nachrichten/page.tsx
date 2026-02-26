import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";

export default async function NachrichtenPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const withUserId = params.with;

  if (withUserId && withUserId !== user.id) {
    const idA = user.id < withUserId ? user.id : withUserId;
    const idB = user.id < withUserId ? withUserId : user.id;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", idA)
      .eq("participant_b", idB)
      .maybeSingle();
    let convId: string;
    if (existing) {
      convId = existing.id;
    } else {
      const { data: inserted } = await supabase
        .from("conversations")
        .insert({ participant_a: idA, participant_b: idB })
        .select("id")
        .single();
      convId = inserted?.id ?? "";
    }
    if (convId) redirect(`/dashboard/nachrichten/${convId}`);
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);
  const convIds = (convs ?? []).map((c) => c.id);

  if (convIds.length === 0) {
    return (
      <Container className="py-16">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
          ← MyBound
        </Link>
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
          <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
          <p className="mt-1 text-sm text-gray-400">Deine Unterhaltungen</p>
        </div>
        <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
          <p className="text-gray-400">Noch keine Unterhaltungen.</p>
          <Link href="/dashboard/entdecken" className="mt-4 inline-block text-accent hover:underline">
            Entdecken →
          </Link>
        </div>
      </Container>
    );
  }

  // Liste wird vom Layout (MessagesLayoutClient) gerendert – hier nur Platzhalter für rechte Spalte
  return (
    <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center border-t border-gray-700 bg-card p-6 md:border-t-0 md:border-l">
      <p className="text-center text-gray-400">Wähle eine Unterhaltung oder starte eine neue.</p>
      <Link href="/dashboard/entdecken" className="mt-4 text-accent hover:underline">
        Entdecken →
      </Link>
    </div>
  );
}
