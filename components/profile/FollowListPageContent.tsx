import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { fetchFollowListProfiles } from "@/lib/follow-list";
import { FollowProfileList } from "@/components/profile/FollowProfileList";

type Props = {
  profileId: string;
  profileNick: string | null;
  kind: "followers" | "following";
  backHref: string;
  backLabel: string;
};

export async function FollowListPageContent({ profileId, profileNick, kind, backHref, backLabel }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = await fetchFollowListProfiles(supabase, profileId, kind);
  const items = await Promise.all(
    rows.map(async (p) => ({
      ...p,
      avatarDisplayUrl: await resolveProfileAvatarUrl(
        { avatar_url: p.avatar_url, avatar_photo_id: p.avatar_photo_id },
        supabase
      ),
    }))
  );

  const title = kind === "followers" ? "Follower" : "Folgt";
  const nick = profileNick?.trim() || "Dieses Profil";
  const subtitle =
    kind === "followers"
      ? `Accounts, die ${nick} folgen`
      : `Accounts, denen ${nick} folgt`;

  return (
    <Container className="py-10 md:py-14">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/95 p-4 shadow-sm md:p-6">
        <FollowProfileList items={items} />
      </div>
    </Container>
  );
}
