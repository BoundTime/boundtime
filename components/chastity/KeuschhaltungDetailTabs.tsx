"use client";

export function KeuschhaltungDetailTabs({
  children,
}: {
  partnerId: string;
  children: React.ReactNode;
}) {
  return <div className="pt-4">{children}</div>;
}
