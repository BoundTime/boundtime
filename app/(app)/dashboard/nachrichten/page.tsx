import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";

export default async function NachrichtenPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("restriction_enabled, restriction_no_messages")
    .eq("id", user.id)
    .single();
  if (myProfile?.restriction_enabled === true && myProfile?.restriction_no_messages === true) {
    return (
      <Container className="py-10 md:py-14">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 transition-colors hover:text-white">
          ← MyBound
        </Link>
        <div className="overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-gradient-to-b from-[#222] to-[#171717] p-6">
          <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
          <p className="mt-1 text-sm text-amber-200/90">Nachrichten sind im Cuckymode (für Paare) eingeschränkt.</p>
        </div>
        <div className="rounded-b-2xl border border-t-0 border-white/10 bg-card p-6 shadow-sm">
          <p className="text-gray-300">Du darfst keine Nachrichten lesen oder schreiben. In den Einstellungen kann die Hotwife die Cuckymode-Einschränkungen fürs Paar anpassen.</p>
          <Link href="/dashboard/einstellungen" className="mt-4 inline-block text-accent hover:underline">
            Einstellungen →
          </Link>
        </div>
      </Container>
    );
  }

  const params = await searchParams;
  const withUserId = params.with;

  if (withUserId && withUserId !== user.id) {
    const idA = user.id < withUserId ? user.id : withUserId;
    const idB = user.id < withUserId ? withUserId : user.id;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", idA)
      .eq("participant_b", idB)
      .maybeSingle();
    let convId: string;
    if (existing) {
      convId = existing.id;
    } else {
      const { data: inserted } = await supabase
        .from("conversations")
        .insert({ participant_a: idA, participant_b: idB })
        .select("id")
        .single();
      convId = inserted?.id ?? "";
    }
    if (convId) redirect(`/dashboard/nachrichten/${convId}`);
  }

  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`);
  const convIds = (convs ?? []).map((c) => c.id);

  if (convIds.length === 0) {
    return (
      <div className="flex h-[calc(100vh-50px)] overflow-hidden">
        {/* Leere Konversationsliste */}
        <div className="hidden md:flex flex-col border-r border-white/10 bg-[#0f0f0f]" style={{ width: 260, flexShrink: 0 }}>
          <div className="border-b border-white/10 px-4 py-3.5">
            <p className="text-[14px] font-medium text-white mb-2">Nachrichten</p>
            <div
              className="w-full rounded-md border border-white/10 bg-[#1a1a1a] px-3 text-[12px] text-gray-600"
              style={{ height: 32, display: "flex", alignItems: "center" }}
            >
              Suchen...
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
            <p className="text-[13px] text-gray-500">Noch keine Nachrichten</p>
            <p className="text-[11px] text-gray-600 mt-1">Starte direkt aus Entdecken</p>
            <Link href="/dashboard/entdecken" className="mt-3 text-[11px] text-[#7B1111] hover:underline">
              Entdecken →
            </Link>
          </div>
        </div>

        {/* Rechte leere Spalte */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center" style={{ background: "#141414" }}>
          <div className="text-3xl mb-3">✉️</div>
          <p className="text-[14px] font-medium text-white">Wähle eine Unterhaltung</p>
          <p className="text-[12px] text-gray-500 mt-1">oder starte eine neue aus Entdecken</p>
          <Link href="/dashboard/entdecken" className="mt-4 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-[12px] text-gray-300 hover:text-white transition-colors">
            Entdecken →
          </Link>
        </div>
      </div>
    );
  }

  // Liste wird vom Layout (MessagesLayoutClient) gerendert – hier nur Platzhalter für rechte Spalte
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center" style={{ background: "#141414" }}>
      <div className="text-3xl mb-3">✉️</div>
      <p className="text-[14px] font-medium text-white">Wähle eine Unterhaltung</p>
      <p className="text-[12px] text-gray-500 mt-1">oder starte eine neue aus Entdecken</p>
      <Link href="/dashboard/entdecken" className="mt-4 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-[12px] text-gray-300 hover:text-white transition-colors">
        Entdecken →
      </Link>
    </div>
  );
}
