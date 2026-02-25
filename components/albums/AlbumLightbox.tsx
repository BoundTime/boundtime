"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
  alt?: string;
};

export function AlbumLightbox({
  images,
  currentIndex,
  onClose,
  onIndexChange,
}: {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(currentIndex - 1);
  }, [hasPrev, currentIndex, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(currentIndex + 1);
  }, [hasNext, currentIndex, onIndexChange]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  if (!current || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Bild vergrößert"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10"
        aria-label="Schließen"
      >
        <X className="h-8 w-8" />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white hover:bg-white/10"
          aria-label="Vorheriges Bild"
        >
          <ChevronLeft className="h-10 w-10" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white hover:bg-white/10"
          aria-label="Nächstes Bild"
        >
          <ChevronRight className="h-10 w-10" />
        </button>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.url}
          alt={current.alt ?? "Albumfoto"}
          className="max-h-[90vh] max-w-full object-contain"
        />
        {images.length > 1 && (
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
