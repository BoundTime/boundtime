import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { VerificationAdminList } from "@/components/VerificationAdminList";

export default async function VerifikationenAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const { data: verifications } = await supabase
    .from("verifications")
    .select("id, user_id, photo_path, status, submitted_at")
    .order("submitted_at", { ascending: false });

  const userIds = Array.from(new Set((verifications ?? []).map((v) => v.user_id)));
  const { data: profs } = userIds.length > 0
    ? await supabase.from("profiles").select("id, nick").in("id", userIds)
    : { data: [] };
  const nickById = new Map((profs ?? []).map((p) => [p.id, p.nick]));

  const verificationsWithNick = await Promise.all(
    (verifications ?? []).map(async (v) => {
      const { data: signed } = await supabase.storage
        .from("verifications")
        .createSignedUrl(v.photo_path, 3600);
      return {
        ...v,
        nick: nickById.get(v.user_id) ?? "?",
        photoUrl: signed?.signedUrl ?? null,
      };
    })
  );

  return (
    <Container className="py-16">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
          ← Zurück zum Dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white">Verifizierungen (Admin)</h1>
        <p className="mt-2 text-sm text-gray-400">
          Neue Anträge prüfen und freigeben oder ablehnen. Das BoundTime-Team wird hier über offene Anträge informiert.
        </p>

        <VerificationAdminList
          verifications={verificationsWithNick}
          adminId={user.id}
        />
      </div>
    </Container>
  );
}
