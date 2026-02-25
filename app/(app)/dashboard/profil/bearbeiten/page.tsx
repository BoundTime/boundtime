import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilBearbeitenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verified")
    .eq("id", user.id)
    .single();

  return (
    <Container className="py-16">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/profil"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Zurück zum Profil
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        <Link
          href="/dashboard/alben"
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white"
        >
          Meine Fotoalben
        </Link>
        {!profile?.verified && (
          <Link
            href="/dashboard/verifizierung"
            className="rounded-lg border border-amber-600/50 px-4 py-2 text-sm text-amber-400 hover:border-amber-500 hover:bg-amber-950/30"
          >
            Verifizierung beantragen
          </Link>
        )}
      </div>
      <div className="rounded-xl border border-gray-700 bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-white">
          Profil bearbeiten
        </h1>
        <p className="mt-2 text-gray-400">
          Alle Angaben sind freiwillig. Nur du entscheidest, was du preisgibst.
        </p>
        <div className="mt-8">
          <ProfileEditForm />
        </div>
      </div>
    </Container>
  );
}
