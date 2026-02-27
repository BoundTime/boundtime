import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { VerificationForm } from "@/components/VerificationForm";
import { VerificationTierBadge } from "@/components/VerificationTierBadge";
import type { VerificationTier } from "@/components/VerificationTierBadge";
import { getProfileProgress, computeVerificationTier } from "@/lib/profile-utils";

export default async function VerifizierungPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verified, verification_tier, avatar_url, avatar_photo_id, postal_code, city, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for, expectations_text, about_me")
    .eq("id", user.id)
    .single();

  const tier = (profile?.verification_tier as VerificationTier) ?? (profile?.verified ? "gold" : "bronze");
  const progress = getProfileProgress(profile as Record<string, unknown> | null);
  const computedTier = computeVerificationTier(profile?.verified ?? false, progress);

  const { data: verification } = await supabase
    .from("verifications")
    .select("id, status, submitted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const tierLabel = tier === "gold" ? "Gold" : tier === "silver" ? "Silber" : "Bronze";

  if (profile?.verified) {
    return (
      <Container className="py-16">
        <div className="mb-6">
          <Link href="/dashboard/profil" className="text-sm text-gray-400 hover:text-white">
            ← Zurück zum Profil
          </Link>
        </div>
        <div className="rounded-xl border border-green-700 bg-green-950/30 p-6">
          <p className="flex items-center gap-2 font-semibold text-green-400">
            <VerificationTierBadge tier="gold" size={20} showLabel />
            Du bist Gold – verifiziert.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Du kannst Album-Zugriffe anfragen und den Dom-Bereich nutzen.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-accent hover:underline">
            ← Zurück zu MyBound
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
        <h1 className="text-2xl font-bold text-white">Verifizierungs-Stufen</h1>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-700 bg-background/50 p-4">
          <VerificationTierBadge tier={computedTier} size={24} showLabel />
          <span className="text-white">Du bist <strong>{tierLabel}</strong>.</span>
        </div>

        <div className="mt-6 space-y-4">
          {computedTier === "bronze" && (
            <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4">
              <p className="font-medium text-amber-300">Nächste Stufe: Silber</p>
              <p className="mt-1 text-sm text-gray-400">
                Fülle dein Profil zu mindestens 80 % aus. Aktuell: {progress} %.
              </p>
              <Link href="/dashboard/profil/bearbeiten" className="mt-3 inline-block text-sm text-accent hover:underline">
                Profil bearbeiten →
              </Link>
            </div>
          )}
          {computedTier === "silver" && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="font-medium text-accent">Nächste Stufe: Gold</p>
              <p className="mt-1 text-sm text-gray-400">
                Bestätige deine Identität mit einem Foto und deinem Ausweis. Dann kannst du Album-Zugriffe anfragen.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Unten kannst du die Verifizierung beantragen.
              </p>
            </div>
          )}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-white">Verifizierung beantragen (Gold)</h2>
        <p className="mt-2 text-sm text-gray-400">
          Lade ein Foto von dir mit deinem Personalausweis hoch. Name und Geburtsdatum müssen erkennbar sein.
          Das BoundTime-Team prüft deine Anfrage manuell.
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
