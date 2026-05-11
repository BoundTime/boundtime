import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nick, role, city")
    .eq("id", user.id)
    .single();

  const { data: unreadRpc } = await supabase.rpc("get_unread_message_count");
  const unreadMessages = Number(unreadRpc ?? 0);

  const { data: activeArr } = await supabase
    .from("chastity_arrangements")
    .select("id, sub_id, dom_id, locked_at, bound_dollars, reward_goal_bound_dollars")
    .or(`dom_id.eq.${user.id},sub_id.eq.${user.id}`)
    .eq("status", "active")
    .limit(1);

  const arr = activeArr?.[0] ?? null;
  const hasActiveKeuschhaltung = !!arr;
  let activeKeuschhaltung = null;

  if (arr) {
    const partnerId = arr.sub_id === user.id ? arr.dom_id : arr.sub_id;
    const { data: partnerProfile } = await supabase
      .from("profiles")
      .select("nick")
      .eq("id", partnerId)
      .single();

    let daysTotal: number | null = null;
    if (arr.reward_goal_bound_dollars && arr.locked_at) {
      const perDay = 10;
      daysTotal = Math.round(arr.reward_goal_bound_dollars / perDay);
    }

    activeKeuschhaltung = {
      partnerNick: partnerProfile?.nick ?? "Partner",
      lockedAt: arr.locked_at,
      daysTotal,
      boundDollars: arr.bound_dollars ?? 0,
    };
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        nick={profile?.nick ?? ""}
        role={profile?.role ?? null}
        city={profile?.city ?? null}
        unreadMessages={unreadMessages}
        hasActiveKeuschhaltung={hasActiveKeuschhaltung}
        activeKeuschhaltung={activeKeuschhaltung}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardTopbar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
