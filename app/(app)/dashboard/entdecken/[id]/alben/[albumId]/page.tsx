import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { AlbumViewer } from "@/components/albums/AlbumViewer";

export default async function AlbumViewPage({
  params,
}: {
  params: Promise<{ id: string; albumId: string }>;
}) {
  const { id: ownerId, albumId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: album } = await supabase
    .from("photo_albums")
    .select("id, name, is_main, owner_id")
    .eq("id", albumId)
    .eq("owner_id", ownerId)
    .single();

  if (!album) notFound();

  const isOwner = album.owner_id === user.id;
  let canView = isOwner || album.is_main;
  if (!canView) {
    const { data: req } = await supabase
      .from("album_view_requests")
      .select("id")
      .eq("album_id", albumId)
      .eq("requester_id", user.id)
      .eq("status", "approved")
      .maybeSingle();
    canView = req != null;
  }

  if (!canView) notFound();

  const { data: photos } = await supabase
    .from("photo_album_photos")
    .select("id, storage_path")
    .eq("album_id", albumId)
    .order("sort_order")
    .order("created_at");

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("nick, avatar_url, avatar_photo_id")
    .eq("id", ownerId)
    .single();

  const avatarUrl = ownerProfile
    ? await resolveProfileAvatarUrl(
        {
          avatar_url: ownerProfile.avatar_url,
          avatar_photo_id: ownerProfile.avatar_photo_id,
        },
        supabase
      )
    : null;

  const photoIds = new Set((photos ?? []).map((p) => p.id));
  const avatarPhotoInAlbum =
    album.is_main &&
    ownerProfile?.avatar_photo_id &&
    photoIds.has(ownerProfile.avatar_photo_id);

  const baseImages = (photos ?? []).map((p) => ({
    id: p.id,
    url: supabase.storage.from("album-photos").getPublicUrl(p.storage_path).data.publicUrl,
    alt: "",
  }));

  const images =
    album.is_main && avatarUrl && !avatarPhotoInAlbum
      ? [{ id: "avatar", url: avatarUrl, alt: "Profilbild" as const }, ...baseImages]
      : avatarPhotoInAlbum && ownerProfile?.avatar_photo_id
        ? (() => {
            const avId = ownerProfile.avatar_photo_id;
            const avImg = baseImages.find((i) => i.id === avId);
            const rest = baseImages.filter((i) => i.id !== avId);
            return avImg ? [avImg, ...rest] : baseImages;
          })()
        : baseImages;

  return (
    <Container className="py-16">
      <Link
        href={`/dashboard/entdecken/${ownerId}`}
        className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
      >
        ← Zurück zu {ownerProfile?.nick ?? "Profil"}
      </Link>

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-white">{album.name}</h1>
        <p className="mt-1 text-sm text-gray-400">
          Album von {ownerProfile?.nick ?? "?"}
          {album.is_main && " (Hauptalbum)"}
        </p>

        <div className="mt-6">
          <AlbumViewer images={images} />
        </div>
        {images.length === 0 && (
          <p className="mt-6 text-sm text-gray-500">Noch keine Fotos in diesem Album.</p>
        )}
      </div>
    </Container>
  );
}
