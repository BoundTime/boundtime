import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Legacy-Seite: Leitet an die API-Route weiter, die den Reset durchführt.
 * E-Mail-Links zeigen jetzt direkt auf /api/restriction/reset?token=xxx.
 */
export default async function ResetCuckymodePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token?.trim()) {
    redirect("/login?error=invalid-reset-link");
  }
  redirect(`/api/restriction/reset?token=${encodeURIComponent(token.trim())}`);
}
