import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FollowListPageContent } from "@/components/profile/FollowListPageContent";
import { canViewerSeeFollowLists } from "@/lib/follow-list";

export const dynamic = "force-dynamic";

export default async function EntdeckenProfilFollowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: owner } = await supabase.from("profiles").select("id, nick").eq("id", id).maybeSingle();
  if (!owner) notFound();

  const allowed = await canViewerSeeFollowLists(supabase, user.id, id);
  if (!allowed) redirect(`/dashboard/entdecken/${id}`);

  return (
    <FollowListPageContent
      profileId={id}
      profileNick={owner.nick}
      kind="followers"
      backHref={`/dashboard/entdecken/${id}`}
      backLabel={`Zurück zu ${owner.nick ?? "Profil"}`}
    />
  );
}
