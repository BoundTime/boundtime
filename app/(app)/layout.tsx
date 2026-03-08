import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { UpdateLastSeen } from "@/components/UpdateLastSeen";
import { RestrictionProvider } from "@/lib/restriction-context";
import { RestrictionBanner } from "@/components/RestrictionBanner";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialRestrictionBlocking = false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, restriction_enabled")
      .eq("id", user.id)
      .single();
    initialRestrictionBlocking =
      profile?.account_type === "couple" && (profile?.restriction_enabled ?? false);
  } else {
    const h = await headers();
    if (h.get("x-bt-user-id") && h.get("x-bt-account-type") === "couple") {
      initialRestrictionBlocking = h.get("x-bt-restriction-enabled") === "1";
    }
  }
  return (
    <RestrictionProvider initialRestrictionBlocking={initialRestrictionBlocking}>
      <UpdateLastSeen />
      <RestrictionBanner />
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </RestrictionProvider>
  );
}
