"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Images, X } from "lucide-react";

type Slot = "female" | "male";

interface CouplePartnerAvatarPickerProps {
  slot: Slot;
  currentImageUrl: string | null;
  ownerId: string;
  label: string;
  age?: number | null;
}

export function CouplePartnerAvatarPicker({
  slot,
  currentImageUrl,
  ownerId,
  label,
  age,
}: CouplePartnerAvatarPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !ownerId) return;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data: album } = await supabase
        .from("photo_albums")
        .select("id")
        .eq("owner_id", ownerId)
        .eq("is_main", true)
        .maybeSingle();
      if (!album) {
        setPhotos([]);
        setLoading(false);
        return;
      }
      const { data: list } = await supabase
        .from("photo_album_photos")
        .select("id, storage_path")
        .eq("album_id", album.id)
        .order("sort_order");
      const urls = (list ?? []).map((p) => ({
        id: p.id,
        url: supabase.storage.from("album-photos").getPublicUrl(p.storage_path).data.publicUrl,
      }));
      setPhotos(urls);
      setLoading(false);
    }
    load();
  }, [open, ownerId]);

  async function setPhoto(photoId: string | null) {
    setSaving(photoId ?? "clear");
    const supabase = createClient();
    const { error } = await supabase.rpc("set_couple_partner_avatar", {
      p_which: slot,
      p_photo_id: photoId,
    });
    setSaving(null);
    if (!error) {
      setOpen(false);
      router.refresh();
    }
  }

  const slotLabel = slot === "female" ? "Frau" : "Mann";

  return (
    <>
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div className="relative">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-700 bg-background sm:h-24 sm:w-24">
            {currentImageUrl ? (
              <img src={currentImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-gray-500">
                <User className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} aria-hidden />
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 bg-card text-gray-400 hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
            title={`Profilbild ${slotLabel} wählen`}
          >
            <Images className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          <h3 className="text-base font-semibold text-white">{label}</h3>
          {age != null && (
            <p className="mt-0.5 text-sm text-gray-400">{age} Jahre</p>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-1 text-xs text-accent hover:underline"
          >
            Bild wählen
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-gray-700 bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h3 className="font-semibold text-white">Profilbild {slotLabel} wählen</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <p className="py-8 text-center text-gray-400">Lade Fotos …</p>
              ) : photos.length === 0 ? (
                <p className="py-8 text-center text-gray-400">
                  Keine Fotos im Hauptalbum. Bitte zuerst unter Alben Fotos hochladen.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    disabled={saving !== null}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 disabled:opacity-50"
                  >
                    Kein Bild
                  </button>
                  {photos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPhoto(p.id)}
                      disabled={saving !== null}
                      className="aspect-square overflow-hidden rounded-lg border-2 border-gray-700 bg-background focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    >
                      <img src={p.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
