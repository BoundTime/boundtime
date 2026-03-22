import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { hasDomForumAccess } from "@/lib/dom-forum-access";
import { MessageSquare, MessageSquarePlus, Users } from "lucide-react";

export default async function ForumHubPage({
  searchParams,
}: {
  searchParams: Promise<{ dom?: string }>;
}) {
  const { dom: domHint } = await searchParams;
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

  const domAccess = hasDomForumAccess(myProfile);

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Forum</h1>
        <p className="mt-2 text-gray-400">
          Austausch in der Community – allgemeine Diskussion und separater Bereich für verifizierte Dom(me)s.
        </p>
      </div>

      {domHint === "no-access" && (
        <div
          className="mb-8 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90"
          role="status"
        >
          Der Dom(me)-Bereich ist nur für verifizierte Nutzer mit Rolle Dom oder Switcher zugänglich. Du kannst
          jedoch am allgemeinen Forum teilnehmen.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/forum/topics"
          className="group flex flex-col rounded-2xl border border-gray-700 bg-card p-6 shadow-sm transition-colors hover:border-accent/40 hover:bg-gray-900/40"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
            <Users className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-white group-hover:text-accent">Allgemeines Forum</h2>
          <p className="mt-2 flex-1 text-sm text-gray-400">
            Themen und Diskussionen für alle eingeloggten Mitglieder – unabhängig von Rolle oder Verifizierung.
          </p>
          <span className="mt-4 text-sm font-medium text-accent group-hover:underline">Zu den Themen →</span>
        </Link>

        <div className="flex flex-col rounded-2xl border border-gray-700 bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
            <MessageSquarePlus className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-white">Dom(me)-Forum</h2>
          <p className="mt-2 text-sm text-gray-400">
            Dieser Bereich ist das Forum für <strong className="text-gray-300">verifizierte</strong> Mitglieder mit
            Rolle <strong className="text-gray-300">Dom</strong> oder <strong className="text-gray-300">Switcher</strong>.
            Als Sub oder ohne diese Berechtigung gibt es hier keinen Lese- oder Schreibzugriff – die Inhalte sind
            serverseitig geschützt.
          </p>
          {domAccess ? (
            <Link
              href="/dashboard/dom-bereich"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
              Zum Dom(me)-Forum
            </Link>
          ) : (
            <p className="mt-4 rounded-lg border border-gray-600 bg-black/30 px-3 py-2 text-xs text-gray-500">
              Kein Zugang – bei Verifizierung und passender Rolle erscheint hier der Einstieg.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
