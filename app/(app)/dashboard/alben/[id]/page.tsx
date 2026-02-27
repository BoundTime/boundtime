import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { AlbumDetailManager } from "@/components/albums/AlbumDetailManager";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: album } = await supabase
    .from("photo_albums")
    .select("id, name, is_main, owner_id")
    .eq("id", id)
    .single();

  if (!album || album.owner_id !== user.id) notFound();

  const { data: photos } = await supabase
    .from("photo_album_photos")
    .select("id, storage_path, fsk18, sort_order, title, caption")
    .eq("album_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_photo_id")
    .eq("id", user.id)
    .single();
  const avatarPhotoId = profile?.avatar_photo_id ?? null;

  const realPhotoIds = (photos ?? []).map((p) => p.id);
  let photoStats: Record<string, { likeCount: number; likedByMe: boolean; commentCount: number }> = {};
  if (realPhotoIds.length > 0) {
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from("photo_album_photo_likes").select("photo_id, user_id").in("photo_id", realPhotoIds),
      supabase.from("photo_album_photo_comments").select("photo_id").in("photo_id", realPhotoIds),
    ]);
    const likeCountByPhoto = new Map<string, number>();
    const likedByMeSet = new Set<string>();
    (likesRes.data ?? []).forEach((r: { photo_id: string; user_id: string }) => {
      likeCountByPhoto.set(r.photo_id, (likeCountByPhoto.get(r.photo_id) ?? 0) + 1);
      if (r.user_id === user.id) likedByMeSet.add(r.photo_id);
    });
    const commentCountByPhoto = new Map<string, number>();
    (commentsRes.data ?? []).forEach((r: { photo_id: string }) => {
      commentCountByPhoto.set(r.photo_id, (commentCountByPhoto.get(r.photo_id) ?? 0) + 1);
    });
    realPhotoIds.forEach((pid) => {
      photoStats[pid] = {
        likeCount: likeCountByPhoto.get(pid) ?? 0,
        likedByMe: likedByMeSet.has(pid),
        commentCount: commentCountByPhoto.get(pid) ?? 0,
      };
    });
  }

  return (
    <Container className="py-16">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/alben" className="text-sm text-gray-400 hover:text-white">
          ← Zurück zu Fotoalben
        </Link>
      </div>

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white">{album.name}</h1>
        <p className="mt-1 text-sm text-gray-400">
          {album.is_main ? "Hauptalbum – für alle sichtbar" : "Auf Anfrage sichtbar"}
        </p>
        <AlbumDetailManager
          albumId={album.id}
          ownerId={user.id}
          initialPhotos={photos ?? []}
          isMainAlbum={album.is_main}
          avatarPhotoId={avatarPhotoId}
          photoStats={photoStats}
        />
      </div>
    </Container>
  );
}
