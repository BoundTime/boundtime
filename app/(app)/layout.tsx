import { BottomNav } from "@/components/BottomNav";
import { UpdateLastSeen } from "@/components/UpdateLastSeen";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UpdateLastSeen />
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
