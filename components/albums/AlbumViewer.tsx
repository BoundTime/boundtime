"use client";

import { useState } from "react";
import { AlbumLightbox } from "./AlbumLightbox";

type ImageItem = {
  id: string;
  url: string;
  alt?: string;
};

export function AlbumViewer({ images }: { images: ImageItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="block aspect-square overflow-hidden rounded-lg border border-gray-700 bg-gray-900 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              className="h-full w-full object-cover"
            />
          </button>
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
    </>
  );
}
