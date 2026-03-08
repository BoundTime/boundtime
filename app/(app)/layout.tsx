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
