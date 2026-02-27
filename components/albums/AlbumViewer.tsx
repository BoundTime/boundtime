"use client";

import { useState } from "react";
import { AlbumLightbox } from "./AlbumLightbox";
import { Heart, MessageCircle } from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
  alt?: string;
};

type PhotoStats = {
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export function AlbumViewer({
  images,
  ownerId,
  albumId,
  photoStats = {},
}: {
  images: ImageItem[];
  ownerId: string;
  albumId: string;
  photoStats?: Record<string, PhotoStats>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((img, index) => {
          const stats = img.id !== "avatar" ? photoStats[img.id] : null;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative block aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="h-full w-full object-cover"
              />
              {stats && (stats.likeCount > 0 || stats.commentCount > 0) && (
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1 text-xs text-white">
                    <Heart className="h-3.5 w-3.5" />
                    {stats.likeCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {stats.commentCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
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
        />
      )}
    </>
  );
}
