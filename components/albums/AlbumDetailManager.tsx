"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, User } from "lucide-react";
import { AlbumLightbox } from "./AlbumLightbox";

type Photo = {
  id: string;
  storage_path: string;
  fsk18: boolean;
  sort_order: number;
  title?: string | null;
  caption?: string | null;
};

export function AlbumDetailManager({
  albumId,
  ownerId,
  initialPhotos,
  isMainAlbum = false,
  avatarPhotoId = null,
}: {
  albumId: string;
  ownerId: string;
  initialPhotos: Photo[];
  isMainAlbum?: boolean;
  avatarPhotoId?: string | null;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [avatarPhotoIdState, setAvatarPhotoIdState] = useState<string | null>(avatarPhotoId);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");

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
        .select("id, storage_path, fsk18, sort_order, title, caption")
        .single();
      if (inserted) added.push(inserted);
    }
    setPhotos((prev) => [...prev, ...added]);
    setUploading(false);
    e.target.value = "";
    router.refresh();
  }

  const images = useMemo(() => {
    return photos.map((p) => ({
      id: p.id,
      url: getUrl(p.storage_path),
      alt: p.title ?? p.caption ?? "",
    }));
  }, [photos]);

  async function deletePhoto(photoId: string, storagePath: string) {
    await supabase.storage.from("album-photos").remove([storagePath]);
    await supabase.from("photo_album_photos").delete().eq("id", photoId);
    if (avatarPhotoIdState === photoId) {
      await supabase.from("profiles").update({ avatar_photo_id: null }).eq("id", ownerId);
      setAvatarPhotoIdState(null);
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    router.refresh();
  }

  async function setAsProfilePhoto(photoId: string) {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo || !isMainAlbum) return;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_photo_id: photoId, avatar_url: null })
      .eq("id", ownerId);
    if (!error) {
      setAvatarPhotoIdState(photoId);
      router.refresh();
    }
  }

  function startEditing(photo: Photo) {
    setEditingPhotoId(photo.id);
    setEditTitle(photo.title ?? "");
    setEditCaption(photo.caption ?? "");
  }

  async function savePhotoEdit(photoId: string) {
    const { error } = await supabase
      .from("photo_album_photos")
      .update({ title: editTitle.trim() || null, caption: editCaption.trim() || null })
      .eq("id", photoId);
    if (!error) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, title: editTitle.trim() || null, caption: editCaption.trim() || null }
            : p
        )
      );
    }
    setEditingPhotoId(null);
    setEditTitle("");
    setEditCaption("");
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
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <img
                src={getUrl(photo.storage_path)}
                alt={photo.title ?? photo.caption ?? ""}
                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
              />
            </button>
            {avatarPhotoIdState === photo.id && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                <User className="h-3 w-3" /> Profilbild
              </span>
            )}
            {isMainAlbum && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAsProfilePhoto(photo.id);
                }}
                className="absolute bottom-2 right-2 rounded bg-accent/90 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                title="Als Profilbild wählen"
              >
                Als Profilbild
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deletePhoto(photo.id, photo.storage_path);
              }}
              className="absolute right-2 top-2 rounded bg-red-600/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              title="Foto entfernen"
              aria-label="Foto entfernen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {(photo.title || photo.caption || editingPhotoId === photo.id) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                {editingPhotoId === photo.id ? (
                  <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Titel"
                      className="w-full rounded border border-gray-600 bg-black/60 px-2 py-1 text-xs text-white placeholder-gray-500"
                    />
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Beschreibung"
                      rows={2}
                      className="w-full resize-none rounded border border-gray-600 bg-black/60 px-2 py-1 text-xs text-white placeholder-gray-500"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => savePhotoEdit(photo.id)}
                        className="rounded bg-accent px-2 py-0.5 text-xs text-white hover:bg-accent-hover"
                      >
                        Speichern
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhotoId(null);
                          setEditTitle("");
                          setEditCaption("");
                        }}
                        className="rounded bg-gray-600 px-2 py-0.5 text-xs text-white hover:bg-gray-500"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {photo.title && (
                      <p className="text-xs font-medium text-white">{photo.title}</p>
                    )}
                    {photo.caption && (
                      <p className="line-clamp-2 text-xs text-gray-300">{photo.caption}</p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(photo);
                      }}
                      className="text-xs text-gray-400 underline hover:text-white"
                    >
                      Bearbeiten
                    </button>
                  </div>
                )}
              </div>
            )}
            {!photo.title && !photo.caption && editingPhotoId !== photo.id && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(photo);
                }}
                className="absolute bottom-2 left-2 rounded bg-black/40 px-2 py-0.5 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
              >
                Titel/Caption hinzufügen
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
      {photos.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Fotos. Lade welche hoch.</p>
      )}
    </div>
  );
}
