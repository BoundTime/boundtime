import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/Container";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResetCuckymodePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token?.trim()) {
    redirect("/login?error=invalid-reset-link");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("consume_restriction_reset_token", {
    p_token: token.trim(),
  });

  if (error) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md rounded-xl border border-gray-700 bg-card p-6 text-center">
          <h1 className="text-xl font-bold text-white">Link ungültig oder abgelaufen</h1>
          <p className="mt-2 text-gray-400">
            Der Reset-Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen Link an (Einstellungen → Cuckymode → Passwort vergessen).
          </p>
          <Link href="/login" className="mt-6 inline-block text-accent hover:underline">
            Zum Login →
          </Link>
        </div>
      </Container>
    );
  }

  redirect("/dashboard/einstellungen?cuckymode_reset=ok");
}
