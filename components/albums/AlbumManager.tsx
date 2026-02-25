"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Folder, Images } from "lucide-react";
import Link from "next/link";

type Album = {
  id: string;
  name: string;
  is_main: boolean;
  created_at: string;
};

export function AlbumManager({
  userId,
  initialAlbums,
}: {
  userId: string;
  initialAlbums: Album[];
}) {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMain = albums.some((a) => a.is_main);

  async function createAlbum(isMain: boolean) {
    const name = isMain ? "Hauptalbum" : newName.trim();
    if (!name) {
      setError("Bitte einen Namen eingeben.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("photo_albums")
      .insert({ owner_id: userId, name, is_main: isMain })
      .select("id, name, is_main, created_at")
      .single();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setAlbums((prev) => [data, ...prev]);
    setNewName("");
    setLoading(false);
    router.refresh();
    if (data) {
      router.push(`/dashboard/alben/${data.id}`);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-700 bg-background/50 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs text-gray-500">Name des neuen Albums</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z. B. ME, Urlaub"
            className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-white placeholder-gray-500"
            maxLength={100}
          />
        </div>
        <button
          type="button"
          onClick={() => createAlbum(false)}
          disabled={loading || !newName.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Album anlegen
        </button>
        {!hasMain && (
          <button
            type="button"
            onClick={() => createAlbum(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-amber-600/50 bg-amber-950/20 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-900/30 disabled:opacity-50"
          >
            <Folder className="h-4 w-4" />
            Hauptalbum anlegen
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/dashboard/alben/${album.id}`}
            className="flex items-center gap-4 rounded-xl border border-gray-700 bg-background p-4 transition-colors hover:border-gray-600 hover:bg-gray-900/50"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-800">
              <Images className="h-7 w-7 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">{album.name}</p>
              <p className="text-xs text-gray-500">
                {album.is_main ? "Hauptalbum (für alle sichtbar)" : "Auf Anfrage sichtbar"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {albums.length === 0 && (
        <p className="text-sm text-gray-500">Noch keine Alben. Lege ein Album an.</p>
      )}
    </div>
  );
}
