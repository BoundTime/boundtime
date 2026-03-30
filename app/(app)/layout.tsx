import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { UpdateLastSeen } from "@/components/UpdateLastSeen";
import { RestrictionProvider } from "@/lib/restriction-context";
import { RestrictionBanner } from "@/components/RestrictionBanner";

export const dynamic = "force-dynamic";

/** App-Bereich nicht indexieren (Login-pflichtig, personenbezogene Inhalte). */
export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialRestrictionBlocking = false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const h = await headers();
  const headerRestriction = h.get("x-bt-restriction-enabled") === "1";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, restriction_enabled")
      .eq("id", user.id)
      .single();
    const fromProfile = profile?.account_type === "couple" && (profile?.restriction_enabled ?? false);
    initialRestrictionBlocking = fromProfile || (profile?.account_type === "couple" && headerRestriction);
  } else if (h.get("x-bt-user-id") && h.get("x-bt-account-type") === "couple") {
    initialRestrictionBlocking = headerRestriction;
  }
  return (
    <RestrictionProvider initialRestrictionBlocking={initialRestrictionBlocking}>
      <UpdateLastSeen />
      <RestrictionBanner />
      {/* Abstand zur Bottom-Nav inkl. Safe Area (Home-Indikator) */}
      <div className="pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</div>
      <BottomNav />
    </RestrictionProvider>
  );
}
