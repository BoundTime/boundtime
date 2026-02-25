import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { VerificationForm } from "@/components/VerificationForm";

export default async function VerifizierungPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verified")
    .eq("id", user.id)
    .single();

  const { data: verification } = await supabase
    .from("verifications")
    .select("id, status, submitted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.verified) {
    return (
      <Container className="py-16">
        <div className="rounded-xl border border-green-700 bg-green-950/30 p-6 text-center">
          <p className="font-semibold text-green-400">Du bist verifiziert.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent hover:underline">
            ← Zurück zum Start
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <div className="mb-6">
        <Link href="/dashboard/profil" className="text-sm text-gray-400 hover:text-white">
          ← Zurück zum Profil
        </Link>
      </div>

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white">Verifizierung beantragen</h1>
        <p className="mt-2 text-sm text-gray-400">
          Lade ein Foto von dir mit deinem Personalausweis hoch. Name und Geburtsdatum müssen erkennbar sein.
          Das BoundTime-Team prüft deine Anfrage manuell. Verifizierte Nutzer können Album-Zugriffe anfragen.
        </p>

        {verification?.status === "pending" && (
          <div className="mt-4 rounded-lg border border-amber-700 bg-amber-950/30 p-4">
            <p className="text-amber-300">Deine Verifizierung wird geprüft. Das kann einige Tage dauern.</p>
          </div>
        )}

        {verification?.status === "rejected" && (
          <div className="mt-4 rounded-lg border border-red-700 bg-red-950/30 p-4">
            <p className="text-red-300">Deine Verifizierung wurde abgelehnt. Du kannst einen neuen Antrag stellen.</p>
          </div>
        )}

        <div className="mt-6">
          <VerificationForm userId={user.id} hasExisting={!!verification} />
        </div>
      </div>
    </Container>
  );
}
