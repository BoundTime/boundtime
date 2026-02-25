import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { AlbumManager } from "@/components/albums/AlbumManager";
import { AlbumRequestsInbox } from "@/components/albums/AlbumRequestsInbox";

export default async function AlbenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: albums } = await supabase
    .from("photo_albums")
    .select("id, name, is_main, created_at")
    .eq("owner_id", user.id)
    .order("is_main", { ascending: false })
    .order("created_at", { ascending: true });

  const albumIds = albums?.map((a) => a.id) ?? [];
  const { data: rawRequests } = albumIds.length > 0
    ? await supabase
        .from("album_view_requests")
        .select("id, album_id, requester_id, status, created_at")
        .in("album_id", albumIds)
        .eq("status", "pending")
    : { data: [] };

  const requests = (rawRequests ?? []).map((r) => ({
    ...r,
    album_name: albums?.find((a) => a.id === r.album_id)?.name ?? "?",
    requester_nick: null as string | null,
  }));
  const requesterIds = Array.from(new Set(requests.map((r) => r.requester_id)));
  if (requesterIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, nick")
      .in("id", requesterIds);
    const nickById = new Map(profs?.map((p) => [p.id, p.nick]) ?? []);
    requests.forEach((r) => { r.requester_nick = nickById.get(r.requester_id) ?? null; });
  }

  return (
    <Container className="py-16">
      <Link href="/dashboard/profil" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
        ← Zurück zum Profil
      </Link>

      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card p-6">
        <h1 className="text-2xl font-bold text-white">Meine Fotoalben</h1>
        <p className="mt-1 text-sm text-gray-400">
          Das Hauptalbum ist für alle sichtbar. Weitere Alben können von anderen Nutzern angefragt werden.
        </p>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <AlbumManager
            userId={user.id}
            initialAlbums={albums ?? []}
          />
          <AlbumRequestsInbox requests={requests} />
        </div>
      </div>
    </Container>
  );
}
