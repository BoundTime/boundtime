"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

type Album = {
  id: string;
  name: string;
  is_main: boolean;
  coverUrl?: string | null;
};

type RequestStatus = "none" | "pending" | "approved" | "rejected";

export function ProfileAlbumsSection({
  ownerId,
  viewerId,
  albums,
  requestStatusByAlbum,
  ownerAvatarUrl = null,
  isViewerVerified = false,
}: {
  ownerId: string;
  viewerId: string;
  albums: Album[];
  requestStatusByAlbum: Record<string, RequestStatus>;
  ownerAvatarUrl?: string | null;
  isViewerVerified?: boolean;
}) {
  const router = useRouter();
  const [loadingAlbumId, setLoadingAlbumId] = useState<string | null>(null);

  const isOwnProfile = ownerId === viewerId;

  async function requestAccess(albumId: string) {
    setLoadingAlbumId(albumId);
    const supabase = createClient();
    const { error } = await supabase.from("album_view_requests").insert({
      album_id: albumId,
      requester_id: viewerId,
      status: "pending",
    });
    setLoadingAlbumId(null);
    router.refresh();
  }

  const mainAlbum = albums.find((a) => a.is_main);
  const otherAlbums = albums.filter((a) => !a.is_main);

  if (albums.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Fotoalben
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {mainAlbum && (
          <AlbumTile album={mainAlbum} ownerId={ownerId} canView avatarUrl={ownerAvatarUrl} />
        )}
        {otherAlbums.map((album) => {
          const status = requestStatusByAlbum[album.id] ?? "none";
          const canView = status === "approved" || isOwnProfile;
          return (
            <div key={album.id} className="relative inline-block">
              <AlbumTile album={album} ownerId={ownerId} canView={canView} avatarUrl={null} />
              {!canView && !isOwnProfile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gray-900/90 py-2">
                  <Lock className="h-6 w-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">{album.name}</span>
                  {status === "none" && (
                    isViewerVerified ? (
                      <button
                        type="button"
                        onClick={() => requestAccess(album.id)}
                        disabled={loadingAlbumId === album.id}
                        className="mt-2 rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                      >
                        {loadingAlbumId === album.id ? "…" : "Anfrage senden"}
                      </button>
                    ) : (
                      <Link
                        href="/dashboard/verifizierung"
                        className="mt-2 inline-block rounded bg-amber-600/80 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
                      >
                        Verifizierung beantragen
                      </Link>
                    )
                  )}
                  {status === "pending" && (
                    <span className="mt-2 text-xs text-amber-400">Anfrage ausstehend</span>
                  )}
                  {status === "rejected" && (
                    <span className="mt-2 text-xs text-red-400">Abgelehnt</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlbumTile({
  album,
  ownerId,
  canView,
  avatarUrl = null,
}: {
  album: Album;
  ownerId: string;
  canView: boolean;
  avatarUrl?: string | null;
}) {
  const coverUrl = (album.is_main && avatarUrl) ? avatarUrl : (album.coverUrl ?? null);
  const href = canView ? `/dashboard/entdecken/${ownerId}/alben/${album.id}` : undefined;

  const content = (
    <div className="flex h-24 w-24 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 sm:h-28 sm:w-28">
      {coverUrl ? (
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl text-gray-600">
          📷
        </div>
      )}
      <div className="bg-gray-900/80 px-2 py-1 text-center text-xs text-gray-300 truncate">
        {album.name}
        {album.is_main && " ★"}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }
  return <div className="block opacity-60">{content}</div>;
}
