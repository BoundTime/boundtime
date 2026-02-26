import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { NOTIFICATION_LABELS, type NotificationType } from "@/types";

export const dynamic = "force-dynamic";

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

function getNotificationHref(type: NotificationType, relatedId: string | null, relatedUserId: string | null): string {
  switch (type) {
    case "new_message":
      return relatedId ? `/dashboard/nachrichten/${relatedId}` : "/dashboard/nachrichten";
    case "new_follower":
    case "profile_view":
    case "profile_like":
      return relatedUserId ? `/dashboard/entdecken/${relatedUserId}` : "/dashboard/entdecken";
    case "post_like":
      return "/dashboard/aktivitaet/post-likes";
    case "chastity_new_task":
    case "chastity_deadline_soon":
    case "chastity_arrangement_offer":
    case "chastity_task_awaiting_confirmation":
    case "chastity_reward_request":
      return "/dashboard/keuschhaltung";
    default:
      return "/dashboard";
  }
}

export default async function BenachrichtigungenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, read_at, created_at, related_user_id, related_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  const list = (notifications ?? []) as Array<{
    id: string;
    type: NotificationType;
    read_at: string | null;
    created_at: string;
    related_user_id: string | null;
    related_id: string | null;
  }>;

  return (
    <Container className="py-16">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Dashboard
      </Link>

      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
        <h1 className="text-2xl font-bold text-white">Benachrichtigungen</h1>
        <p className="mt-1 text-sm text-gray-400">Alle In-App-Hinweise</p>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
        {list.length === 0 ? (
          <p className="text-gray-400">Noch keine Benachrichtigungen.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => (
              <li key={n.id}>
                <Link
                  href={getNotificationHref(n.type, n.related_id, n.related_user_id)}
                  className="flex items-center justify-between rounded-xl border border-gray-700 bg-background/50 px-4 py-3 text-left transition-colors hover:border-gray-600"
                >
                  <span className="text-sm text-white">{NOTIFICATION_LABELS[n.type]}</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(new Date(n.created_at))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
