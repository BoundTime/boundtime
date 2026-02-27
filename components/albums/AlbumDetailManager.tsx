"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, User, Check } from "lucide-react";
import { AlbumLightbox } from "./AlbumLightbox";

type Photo = {
  id: string;
  storage_path: string;
  fsk18: boolean;
  sort_order: number;
  title?: string | null;
  caption?: string | null;
};

type PhotoStats = {
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export function AlbumDetailManager({
  albumId,
  ownerId,
  initialPhotos,
  isMainAlbum = false,
  avatarPhotoId = null,
  photoStats = {},
}: {
  albumId: string;
  ownerId: string;
  initialPhotos: Photo[];
  isMainAlbum?: boolean;
  avatarPhotoId?: string | null;
  photoStats?: Record<string, PhotoStats>;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [avatarPhotoIdState, setAvatarPhotoIdState] = useState<string | null>(avatarPhotoId);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [pendingEditIds, setPendingEditIds] = useState<Set<string>>(new Set());

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
    setPendingEditIds((prev) => new Set([...Array.from(prev), ...added.map((p) => p.id)]));
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

  async function savePhotoEdit(photoId: string, title?: string, caption?: string) {
    const t = title ?? editTitle;
    const c = caption ?? editCaption;
    const { error } = await supabase
      .from("photo_album_photos")
      .update({ title: t.trim() || null, caption: c.trim() || null })
      .eq("id", photoId);
    if (!error) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, title: t.trim() || null, caption: c.trim() || null } : p
        )
      );
    }
    setEditingPhotoId(null);
    setEditTitle("");
    setEditCaption("");
    setPendingEditIds((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
    router.refresh();
  }

  const pendingPhotos = photos.filter((p) => pendingEditIds.has(p.id));

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-600 bg-background/50 px-4 py-3 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300">
          <Upload className="h-4 w-4" />
          {uploading ? "Wird hochgeladen …" : "Schritt 1: Fotos hochladen"}
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

      {/* Bearbeitung neuer Fotos: größere Darstellung, Titel/Caption vor Übernahme ins Album */}
      {pendingPhotos.length > 0 && (
        <div className="rounded-xl border border-accent/40 bg-background/50 p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
            Neue Fotos bearbeiten – Schritt 2 von 2
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Gib optional Titel und Beschreibung ein. Dann übernimm die Fotos ins Album.
          </p>
          <div className="space-y-6">
            {pendingPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4 sm:flex-row sm:gap-6"
              >
                <div className="aspect-square w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg border border-gray-700 sm:max-w-[160px]">
                  <img
                    src={getUrl(photo.storage_path)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    type="text"
                    value={editingPhotoId === photo.id ? editTitle : (photo.title ?? "")}
                    onChange={(e) => {
                      if (editingPhotoId === photo.id) setEditTitle(e.target.value);
                      else {
                        setEditingPhotoId(photo.id);
                        setEditTitle(e.target.value);
                        setEditCaption(photo.caption ?? "");
                      }
                    }}
                    onFocus={() => {
                      if (editingPhotoId !== photo.id) {
                        setEditingPhotoId(photo.id);
                        setEditTitle(photo.title ?? "");
                        setEditCaption(photo.caption ?? "");
                      }
                    }}
                    placeholder="Titel (optional)"
                    className="w-full rounded border border-gray-600 bg-background px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <textarea
                    value={editingPhotoId === photo.id ? editCaption : (photo.caption ?? "")}
                    onChange={(e) => {
                      if (editingPhotoId === photo.id) setEditCaption(e.target.value);
                      else {
                        setEditingPhotoId(photo.id);
                        setEditTitle(photo.title ?? "");
                        setEditCaption(e.target.value);
                      }
                    }}
                    onFocus={() => {
                      if (editingPhotoId !== photo.id) {
                        setEditingPhotoId(photo.id);
                        setEditTitle(photo.title ?? "");
                        setEditCaption(photo.caption ?? "");
                      }
                    }}
                    placeholder="Beschreibung (optional)"
                    rows={3}
                    className="w-full resize-none rounded border border-gray-600 bg-background px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const title = editingPhotoId === photo.id ? editTitle : (photo.title ?? "");
                        const caption = editingPhotoId === photo.id ? editCaption : (photo.caption ?? "");
                        const { error } = await supabase
                          .from("photo_album_photos")
                          .update({ title: title.trim() || null, caption: caption.trim() || null })
                          .eq("id", photo.id);
                        if (!error) {
                          setPhotos((prev) =>
                            prev.map((p) =>
                              p.id === photo.id
                                ? { ...p, title: title.trim() || null, caption: caption.trim() || null }
                                : p
                            )
                          );
                          setEditingPhotoId(null);
                          setEditTitle("");
                          setEditCaption("");
                          setPendingEditIds((prev) => {
                            const next = new Set(prev);
                            next.delete(photo.id);
                            return next;
                          });
                          router.refresh();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
                    >
                      <Check className="h-4 w-4" />
                      Übernehmen
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingEditIds((prev) => {
                        const next = new Set(prev);
                        next.delete(photo.id);
                        return next;
                      })}
                      className="rounded bg-gray-600 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-500"
                    >
                      Überspringen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPendingEditIds(new Set())}
            className="mt-4 rounded bg-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-500"
          >
            Alle übernehmen (ohne weitere Bearbeitung)
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <img
              src={getUrl(photo.storage_path)}
              alt={photo.title ?? photo.caption ?? ""}
              className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
            />
            {avatarPhotoIdState === photo.id && (
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                <User className="h-3 w-3" /> Profilbild
              </span>
            )}
            {(photo.title || photo.caption) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                {photo.title && (
                  <p className="text-xs font-medium text-white">{photo.title}</p>
                )}
                {photo.caption && (
                  <p className="line-clamp-2 text-xs text-gray-300">{photo.caption}</p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <AlbumLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          ownerId={ownerId}
          albumId={albumId}
          photoStats={photoStats}
          ownerMode={{
            photos: photos.map((p) => ({
              id: p.id,
              storage_path: p.storage_path,
              title: p.title,
              caption: p.caption,
            })),
            isMainAlbum,
            onSetAsProfile: setAsProfilePhoto,
            onDelete: deletePhoto,
            onSaveEdit: async (photoId, title, caption) => {
              await savePhotoEdit(photoId, title, caption);
            },
          }}
        />
      )}
      {photos.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Fotos. Lade welche hoch.</p>
      )}
    </div>
  );
}
