import { BottomNav } from "@/components/BottomNav";
import { UpdateLastSeen } from "@/components/UpdateLastSeen";
import { RestrictionProvider } from "@/lib/restriction-context";
import { RestrictionBanner } from "@/components/RestrictionBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestrictionProvider>
      <UpdateLastSeen />
      <RestrictionBanner />
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </RestrictionProvider>
  );
}
