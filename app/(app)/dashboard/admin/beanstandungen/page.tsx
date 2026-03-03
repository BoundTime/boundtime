import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { BullDisputesList } from "@/components/bull/BullDisputesList";

export default async function BeanstandungenAdminPage() {
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

  const { data: disputes } = await supabase
    .from("bull_rating_disputes")
    .select("id, bull_rating_id, bull_id, reason_text, created_at, status")
    .order("created_at", { ascending: false });

  const ratingIds = Array.from(new Set((disputes ?? []).map((d) => d.bull_rating_id)));
  const { data: ratings } =
    ratingIds.length > 0
      ? await supabase
          .from("bull_ratings")
          .select("id, bull_id, rater_id, rating, comment, created_at")
          .in("id", ratingIds)
      : { data: [] };

  const bullIds = Array.from(new Set([...(disputes ?? []).map((d) => d.bull_id), ...(ratings ?? []).map((r) => r.bull_id)]));
  const raterIds = Array.from(new Set((ratings ?? []).map((r) => r.rater_id)));
  const allUserIds = Array.from(new Set([...bullIds, ...raterIds]));
  const { data: profs } =
    allUserIds.length > 0 ? await supabase.from("profiles").select("id, nick").in("id", allUserIds) : { data: [] };
  const nickById = new Map((profs ?? []).map((p) => [p.id, p.nick]));

  const ratingById = new Map((ratings ?? []).map((r) => [r.id, r]));

  const disputesWithDetails = (disputes ?? []).map((d) => {
    const rating = ratingById.get(d.bull_rating_id);
    return {
      ...d,
      rating: rating?.rating ?? null,
      comment: rating?.comment ?? null,
      raterNick: rating ? nickById.get(rating.rater_id) ?? "?" : "?",
      bullNick: nickById.get(d.bull_id) ?? "?",
    };
  });

  return (
    <Container className="py-16">
      <div className="mb-6">
        <Link href="/dashboard/einstellungen" className="text-sm text-gray-400 hover:text-white">
          ← Zurück zu Einstellungen
        </Link>
      </div>

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white">Beanstandungen (Bull-Bewertungen)</h1>
        <p className="mt-2 text-sm text-gray-400">
          Bulls können Bewertungen beanstanden. Hier siehst du offene und erledigte Fälle.
        </p>

        <BullDisputesList disputes={disputesWithDetails} />
      </div>
    </Container>
  );
}
