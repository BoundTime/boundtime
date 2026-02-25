"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2 } from "lucide-react";
import { AlbumLightbox } from "./AlbumLightbox";

type Photo = {
  id: string;
  storage_path: string;
  fsk18: boolean;
  sort_order: number;
};

export function AlbumDetailManager({
  albumId,
  ownerId,
  initialPhotos,
  isMainAlbum = false,
  avatarUrl = null,
}: {
  albumId: string;
  ownerId: string;
  initialPhotos: Photo[];
  isMainAlbum?: boolean;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const supabase = createClient();
  const getUrl = (path: string) =>
    supabase.storage.from("album-photos").getPublicUrl(path).data.publicUrl;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const added: Photo[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${ownerId}/${albumId}/${Date.now()}_${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("album-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        setUploading(false);
        return;
      }
      const maxOrder = photos.length > 0
        ? Math.max(...photos.map((p) => p.sort_order))
        : -1;
      const { data: inserted } = await supabase
        .from("photo_album_photos")
        .insert({
          album_id: albumId,
          storage_path: path,
          fsk18: false,
          sort_order: maxOrder + 1,
        })
        .select("id, storage_path, fsk18, sort_order")
        .single();
      if (inserted) added.push(inserted);
    }
    setPhotos((prev) => [...prev, ...added]);
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  const images = useMemo(() => {
    const list: { id: string; url: string; alt?: string }[] = [];
    if (isMainAlbum && avatarUrl) {
      list.push({ id: "avatar", url: avatarUrl, alt: "Profilbild" });
    }
    photos.forEach((p) => {
      list.push({ id: p.id, url: getUrl(p.storage_path), alt: "" });
    });
    return list;
  }, [isMainAlbum, avatarUrl, photos]);

  async function deletePhoto(photoId: string, storagePath: string) {
    await supabase.storage.from("album-photos").remove([storagePath]);
    await supabase.from("photo_album_photos").delete().eq("id", photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-600 bg-background/50 px-4 py-3 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300">
          <Upload className="h-4 w-4" />
          {uploading ? "Wird hochgeladen …" : "Fotos hochladen"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
              />
            </button>
            {img.id === "avatar" && (
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                Profilbild
              </span>
            )}
            {img.id !== "avatar" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deletePhoto(img.id, (photos.find((p) => p.id === img.id) as Photo)?.storage_path ?? ""); }}
                className="absolute right-2 top-2 rounded bg-red-600/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                title="Foto entfernen"
                aria-label="Foto entfernen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && (
        <AlbumLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
      {photos.length === 0 && !(isMainAlbum && avatarUrl) && (
        <p className="text-sm text-gray-500">Noch keine Fotos. Lade welche hoch.</p>
      )}
    </div>
  );
}
