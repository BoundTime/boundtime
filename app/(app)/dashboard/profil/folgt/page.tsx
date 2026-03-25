import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FollowListPageContent } from "@/components/profile/FollowListPageContent";

export const dynamic = "force-dynamic";

export default async function MeinProfilFolgtPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: owner } = await supabase.from("profiles").select("nick").eq("id", user.id).single();
  if (!owner) redirect("/login");

  return (
    <FollowListPageContent
      profileId={user.id}
      profileNick={owner.nick}
      kind="following"
      backHref="/dashboard/profil"
      backLabel="Zurück zum Profil"
    />
  );
}
