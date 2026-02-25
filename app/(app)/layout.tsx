import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
