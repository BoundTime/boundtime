"use client";
import { usePathname } from "next/navigation";

/** Renders children only when NOT on the landing page "/" */
export function HideOnLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}

/** Wraps the app shell (zoom + footer) – skipped on landing page "/" */
export function AppShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/") {
    return <main className="flex-1">{children}</main>;
  }
  return (
    <div
      className="relative z-10 flex flex-1 flex-col origin-top"
      style={{ zoom: 0.9 }}
    >
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}
