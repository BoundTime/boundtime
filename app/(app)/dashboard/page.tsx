import Link from "next/link";
import { Heart, LockKeyhole, Rss, Eye } from "lucide-react";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityStatusBlock } from "@/components/chastity/ChastityStatusBlock";
import { NewPostForm } from "@/components/NewPostForm";
import { PostLikeButton } from "@/components/PostLikeButton";
import { ProfileViewsBlock } from "@/components/ProfileViewsBlock";
import { ProfileLikesBlock } from "@/components/ProfileLikesBlock";
import { PostLikesBlock } from "@/components/PostLikesBlock";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ChastityLockDuration } from "@/components/chastity/ChastityLockDuration";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString("de-DE");
}

const PROFILE_SLOTS = 10;

function getProfileProgress(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;
  let filled = 0;
  if (profile.avatar_url) filled++;
  if (profile.postal_code || profile.city) filled++;
  if (profile.height_cm != null && profile.height_cm !== "") filled++;
  if (profile.weight_kg != null && profile.weight_kg !== "") filled++;
  if (profile.body_type) filled++;
  if (profile.date_of_birth || profile.age_range) filled++;
  if (profile.looking_for_gender) filled++;
  const lf = profile.looking_for;
  if (Array.isArray(lf) && lf.length > 0) filled++;
  else if (lf) filled++;
  if (profile.expectations_text && String(profile.expectations_text).trim()) filled++;
  if (profile.about_me && String(profile.about_me).trim()) filled++;
  return Math.round((filled / PROFILE_SLOTS) * 100);
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "nick, role, avatar_url, postal_code, city, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for, expectations_text, about_me, is_admin, bound_dollars"
    )
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? null;
  const isAdmin = profile?.is_admin ?? false;
  const progress = getProfileProgress(profile as Record<string, unknown> | null);

  await supabase.rpc("create_deadline_soon_notifications").then(() => {});

  const { data: activeArrangements } = await supabase
    .from("chastity_arrangements")
    .select("id, dom_id, sub_id, locked_at, bound_dollars, reward_goal_bound_dollars")
    .or(`dom_id.eq.${user.id},sub_id.eq.${user.id}`)
    .eq("status", "active");

  const asSubArrangement = activeArrangements?.find((a) => a.sub_id === user.id) ?? null;
  const asDomArrangements = activeArrangements?.filter((a) => a.dom_id === user.id) ?? [];
  const subIds = asDomArrangements.map((a) => a.sub_id);
  const { data: subProfiles } = await supabase
    .from("profiles")
    .select("id, nick, avatar_url, verified")
    .in("id", subIds);
  const subProfileById = new Map(subProfiles?.map((p) => [p.id, p]) ?? []);
  const asDomWithSub = asDomArrangements.map((a) => {
    const sub = subProfileById.get(a.sub_id);
    let subAvatarUrl: string | null = null;
    if (sub?.avatar_url) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(sub.avatar_url);
      subAvatarUrl = data.publicUrl;
    }
    return {
      id: a.id,
      subId: a.sub_id,
      subNick: sub?.nick ?? "?",
      subAvatarUrl,
      subVerified: sub?.verified ?? false,
      lockedAt: a.locked_at,
      boundDollars: a.bound_dollars ?? 0,
      rewardGoalBoundDollars: a.reward_goal_bound_dollars ?? 0,
    };
  });

  const isDomOrSwitcher = role === "Dom" || role === "Switcher";
  const domArrangementIds = asDomArrangements.map((a) => a.id);
  const pendingTasksByArrangement = new Map<string, number>();
  const pendingRewardsByArrangement = new Map<string, number>();
  const pendingChecksByArrangement = new Map<string, number>();
  const openPoints: Array<{ type: string; label: string; href: string }> = [];
  if (isDomOrSwitcher && domArrangementIds.length > 0) {
    const [rewardRes, checkRes, tasksRes] = await Promise.all([
      supabase.from("chastity_reward_requests").select("id, arrangement_id").in("arrangement_id", domArrangementIds).eq("status", "pending"),
      supabase.from("chastity_random_checks").select("id, arrangement_id").in("arrangement_id", domArrangementIds).eq("status", "pending"),
      supabase.from("chastity_tasks").select("id, arrangement_id").in("arrangement_id", domArrangementIds).eq("status", "pending"),
    ]);
    const rewards = rewardRes.data ?? [];
    const checks = checkRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    for (const t of tasks) {
      pendingTasksByArrangement.set(t.arrangement_id, (pendingTasksByArrangement.get(t.arrangement_id) ?? 0) + 1);
    }
    for (const r of rewards) {
      pendingRewardsByArrangement.set(r.arrangement_id, (pendingRewardsByArrangement.get(r.arrangement_id) ?? 0) + 1);
      const arr = asDomWithSub.find((a) => a.id === r.arrangement_id);
      if (arr) openPoints.push({ type: "reward", label: `Belohnungsanfrage von ${arr.subNick}`, href: `/dashboard/keuschhaltung/${r.arrangement_id}` });
    }
    for (const c of checks) {
      pendingChecksByArrangement.set(c.arrangement_id, (pendingChecksByArrangement.get(c.arrangement_id) ?? 0) + 1);
      const arr = asDomWithSub.find((a) => a.id === c.arrangement_id);
      if (arr) openPoints.push({ type: "check", label: `Spontan-Check offen: ${arr.subNick}`, href: `/dashboard/keuschhaltung/${c.arrangement_id}` });
    }
    for (const a of asDomWithSub) {
      const n = pendingTasksByArrangement.get(a.id) ?? 0;
      if (n > 0) openPoints.push({ type: "tasks", label: `${a.subNick}: ${n} offene Aufgabe(n)`, href: `/dashboard/keuschhaltung/${a.id}` });
    }
  }

  const { data: followed } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds = (followed ?? []).map((f) => f.following_id);

  let posts: Array<{
    id: string;
    author_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    author_nick: string | null;
    author_avatar_url: string | null;
    author_verified: boolean;
  }> = [];
  if (followingIds.length > 0) {
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, author_id, content, image_url, created_at")
      .in("author_id", followingIds)
      .order("created_at", { ascending: false })
      .limit(50);
    if (postsData?.length) {
      const authorIds = Array.from(new Set(postsData.map((p) => p.author_id)));
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, nick, avatar_url, verified")
        .in("id", authorIds);
      const authorById = new Map(authors?.map((a) => [a.id, a]) ?? []);
      posts = postsData.map((p) => {
        const a = authorById.get(p.author_id);
        let avatarUrl: string | null = null;
        if (a?.avatar_url) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(a.avatar_url);
          avatarUrl = data.publicUrl;
        }
        return {
          ...p,
          author_nick: a?.nick ?? null,
          author_avatar_url: avatarUrl,
          author_verified: a?.verified ?? false,
        };
      });
    }
  }

  const postIds = posts.map((p) => p.id);
  const postLikeByPostId: Record<string, { count: number; likedByMe: boolean }> = {};
  if (postIds.length > 0) {
    const [countRes, myLikesRes] = await Promise.all([
      supabase.from("post_likes").select("post_id").in("post_id", postIds),
      supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds),
    ]);
    const countByPost = new Map<string, number>();
    (countRes.data ?? []).forEach((r: { post_id: string }) => countByPost.set(r.post_id, (countByPost.get(r.post_id) ?? 0) + 1));
    const myLikedPostIds = new Set((myLikesRes.data ?? []).map((r: { post_id: string }) => r.post_id));
    postIds.forEach((pid) => {
      postLikeByPostId[pid] = { count: countByPost.get(pid) ?? 0, likedByMe: myLikedPostIds.has(pid) };
    });
  }

  const [profileLikesRes, myPostsRes] = await Promise.all([
    supabase
      .from("profile_likes")
      .select("liker_id, liked_at")
      .eq("profile_id", user.id)
      .order("liked_at", { ascending: false })
      .limit(20),
    supabase.from("posts").select("id, content").eq("author_id", user.id),
  ]);
  const myPostIds = new Set((myPostsRes.data ?? []).map((p: { id: string }) => p.id));
  const postById = new Map((myPostsRes.data ?? []).map((p: { id: string; content: string | null }) => [p.id, p]));
  let postLikersRes: { data: Array<{ post_id: string; user_id: string; liked_at: string }> | null } = { data: [] };
  if (myPostIds.size > 0) {
    postLikersRes = await supabase
      .from("post_likes")
      .select("post_id, user_id, liked_at")
      .in("post_id", Array.from(myPostIds))
      .order("liked_at", { ascending: false })
      .limit(50);
  }
  const likerIds = Array.from(new Set((profileLikesRes.data ?? []).map((l: { liker_id: string }) => l.liker_id)));
  const postLikerIds = Array.from(new Set((postLikersRes.data ?? []).map((l: { user_id: string }) => l.user_id)));
  const allActivityUserIds = Array.from(new Set([...likerIds, ...postLikerIds]));
  const { data: activityProfiles } = allActivityUserIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, nick, avatar_url")
        .in("id", allActivityUserIds)
    : { data: [] };
  const profileById = new Map(activityProfiles?.map((p) => [p.id, p]) ?? []);

  function activityAvatarUrl(avatarPath: string | null): string | null {
    if (!avatarPath) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    return data.publicUrl;
  }

  return (
    <Container className="py-16">
      {/* 1. Chastity-Status oben (nur für Sub oder Dom ohne Keuschlinge – Dom mit Keuschlingen sehen den Block „Ihre Keuschlinge“) */}
      {!(isDomOrSwitcher && asDomWithSub.length > 0) && (
        <div className="overflow-hidden rounded-xl border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between bg-gradient-to-b from-gray-800/80 to-card px-6 py-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <LockKeyhole className="h-5 w-5 text-gray-400" />
              Keuschhaltung
            </h2>
          </div>
          <div className="rounded-b-xl border-t border-gray-700 bg-card p-6">
            <ChastityStatusBlock
              role={role}
              asSubArrangement={
                asSubArrangement
                  ? {
                      id: asSubArrangement.id,
                      lockedAt: asSubArrangement.locked_at,
                      boundDollars: asSubArrangement.bound_dollars ?? 0,
                      rewardGoalBoundDollars: asSubArrangement.reward_goal_bound_dollars ?? 0,
                    }
                  : null
              }
              asDomArrangements={asDomWithSub}
              profileBoundDollars={!asSubArrangement ? (profile?.bound_dollars ?? 0) : undefined}
            />
          </div>
        </div>
      )}

      {/* 1b. Dom-Dashboard: Ihre Keuschlinge + Offene Punkte (nur für Dom/Switcher mit aktiven Vereinbarungen) */}
      {isDomOrSwitcher && asDomWithSub.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-700 shadow-sm">
          <div className="bg-gradient-to-b from-gray-800/80 to-card px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Ihre Keuschlinge</h2>
          </div>
          <div className="space-y-6 border-t border-gray-700 bg-card p-6">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {asDomWithSub.map((arr) => {
              const pendingTasks = pendingTasksByArrangement.get(arr.id) ?? 0;
              return (
                <li key={arr.id}>
                  <Link
                    href={`/dashboard/keuschhaltung/${arr.id}`}
                    className="flex items-center gap-4 rounded-lg border border-gray-700 bg-background p-4 transition-colors hover:border-gray-600"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-700">
                      {arr.subAvatarUrl ? (
                        <img src={arr.subAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                          {(arr.subNick ?? "?").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-medium text-white">
                        {arr.subNick}
                        {arr.subVerified && <VerifiedBadge size={12} />}
                      </p>
                      <p className="text-xs text-gray-400">
                        {arr.lockedAt ? (
                          <ChastityLockDuration lockedAt={arr.lockedAt} arrangementId={arr.id} />
                        ) : (
                          "Noch nicht verschlossen"
                        )}
                      </p>
                      {(pendingTasks > 0 || (pendingRewardsByArrangement.get(arr.id) ?? 0) > 0 || (pendingChecksByArrangement.get(arr.id) ?? 0) > 0) && (
                        <p className="mt-0.5 text-xs text-amber-400">
                          {[
                            pendingTasks > 0 && `${pendingTasks} offene Aufgabe(n)`,
                            (pendingRewardsByArrangement.get(arr.id) ?? 0) > 0 && "Belohnungsanfrage(n)",
                            (pendingChecksByArrangement.get(arr.id) ?? 0) > 0 && "Spontan-Check(s) offen",
                          ].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {openPoints.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-white">Offene Punkte</h3>
              <ul className="space-y-2">
                {openPoints.slice(0, 10).map((item, i) => (
                  <li key={`${item.type}-${i}`}>
                    <Link href={item.href} className="text-sm text-accent hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {openPoints.length > 10 && (
                  <li>
                    <Link href="/dashboard/keuschhaltung" className="text-sm text-gray-400 hover:text-white">
                      + {openPoints.length - 10} weitere in Keuschhaltung →
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}
          </div>
        </div>
      )}

      {/* Aktivität: 3 Blöcke */}
      <div className="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-gray-700 shadow-sm">
          <div className="bg-gradient-to-b from-gray-800/80 to-card px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Eye className="h-4 w-4 text-gray-400" />
              Wer hat dein Profil besucht
            </h3>
          </div>
          <div className="rounded-b-xl border-t border-gray-700 bg-card p-3">
            <ProfileViewsBlock hideTitle />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-700 shadow-sm">
          <div className="bg-gradient-to-b from-gray-800/80 to-card px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Heart className="h-4 w-4 text-gray-400" />
              Wer hat dein Profil geliked
            </h3>
          </div>
          <div className="rounded-b-xl border-t border-gray-700 bg-card p-3">
            <ProfileLikesBlock
              likes={profileLikesRes.data ?? []}
              profiles={activityProfiles ?? []}
              hideTitle
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-700 shadow-sm">
          <div className="bg-gradient-to-b from-gray-800/80 to-card px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Heart className="h-4 w-4 text-gray-400" />
              Wer hat deine Posts geliked
            </h3>
          </div>
          <div className="rounded-b-xl border-t border-gray-700 bg-card p-3">
            <PostLikesBlock
              likes={postLikersRes.data ?? []}
              profiles={activityProfiles ?? []}
              posts={myPostsRes.data ?? []}
              hideTitle
            />
          </div>
        </div>
      </div>

      {/* 2. Feed zentral: Header-Karte + Inhalts-Karte */}
      <div className="mt-12 overflow-hidden rounded-xl border border-gray-700 shadow-sm">
        <div className="bg-gradient-to-b from-gray-800/80 to-card px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Rss className="h-5 w-5 text-gray-400" />
            Feed
          </h2>
        </div>
        <div className="rounded-b-xl border-t border-gray-700 bg-card p-6 shadow-sm">
          <NewPostForm />
          {posts.length > 0 ? (
            <ul className="mt-6 space-y-6">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-gray-700 bg-background/50 shadow-sm"
                >
                  <div className="flex items-center gap-4 p-4">
                    <Link href={`/dashboard/entdecken/${post.author_id}`} className="shrink-0">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-700 bg-background">
                        {post.author_avatar_url ? (
                          <img src={post.author_avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-base font-semibold text-accent">
                            {(post.author_nick ?? "?").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/entdecken/${post.author_id}`}
                          className="font-medium text-white hover:text-accent"
                        >
                          {post.author_nick ?? "?"}
                        </Link>
                        {post.author_verified && <VerifiedBadge size={14} />}
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(post.created_at))}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 px-4 pb-4 pt-1">
                    <p className="whitespace-pre-wrap text-gray-300">{post.content}</p>
                    {post.image_url && (
                      <div className="mt-4 overflow-hidden rounded-lg">
                        <img
                          src={supabase.storage.from("post-images").getPublicUrl(post.image_url).data.publicUrl}
                          alt=""
                          className="max-h-[28rem] w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="mt-3 flex items-center">
                      <PostLikeButton
                        postId={post.id}
                        initialLiked={postLikeByPostId[post.id]?.likedByMe ?? false}
                        initialCount={postLikeByPostId[post.id]?.count ?? 0}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-xl border border-gray-700 bg-background/50 p-8 text-center">
              <p className="text-gray-400">Folge Leuten, um deren Posts hier zu sehen.</p>
              <Link href="/dashboard/entdecken" className="mt-4 inline-block text-accent hover:underline">
                Entdecken →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profil-Fortschritt dezent */}
      {progress < 100 && (
        <p className="mt-6 text-center text-xs text-gray-600">
          Profil zu {progress} % ·{" "}
          <Link href="/dashboard/profil" className="text-accent/80 hover:text-accent hover:underline">
            vervollständigen
          </Link>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
        <Link href="/community-regeln" className="text-accent transition-colors duration-150 hover:underline hover:text-accent-hover">
          Community-Regeln
        </Link>
        {isAdmin && (
          <Link href="/dashboard/admin/verifikationen" className="text-amber-400 transition-colors duration-150 hover:underline hover:text-amber-300">
            Verifikationen prüfen
          </Link>
        )}
      </div>
    </Container>
  );
}
