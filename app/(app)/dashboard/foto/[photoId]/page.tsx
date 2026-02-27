import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FotoRedirectPage({
  params,
}: {
  params: Promise<{ photoId: string }>;
}) {
  const { photoId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: photo } = await supabase
    .from("photo_album_photos")
    .select("id, album_id")
    .eq("id", photoId)
    .single();

  if (!photo) notFound();

  const { data: album } = await supabase
    .from("photo_albums")
    .select("owner_id")
    .eq("id", photo.album_id)
    .single();

  if (!album) notFound();

  redirect(`/dashboard/entdecken/${album.owner_id}/alben/${photo.album_id}#photo-${photoId}`);
}
