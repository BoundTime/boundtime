"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, User, Trash2, Pencil } from "lucide-react";

type ImageItem = {
  id: string;
  url: string;
  alt?: string;
};

type OwnerPhoto = {
  id: string;
  storage_path: string;
  title?: string | null;
  caption?: string | null;
};

export function AlbumLightbox({
  images,
  currentIndex,
  onClose,
  onIndexChange,
  ownerMode,
}: {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  ownerMode?: {
    photos: OwnerPhoto[];
    isMainAlbum: boolean;
    onSetAsProfile: (photoId: string) => void;
    onDelete: (photoId: string, storagePath: string) => void;
    onSaveEdit: (photoId: string, title: string, caption: string) => void;
  };
}) {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const currentOwnerPhoto = ownerMode?.photos?.[currentIndex] ?? null;
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentOwnerPhoto) {
      setEditTitle(currentOwnerPhoto.title ?? "");
      setEditCaption(currentOwnerPhoto.caption ?? "");
      setIsEditing(false);
    }
  }, [currentOwnerPhoto, currentIndex]);

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90"
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
        className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Klickbare Zonen: links = vorheriges, rechts = nächstes Foto */}
        <div className="relative flex w-full max-w-[90vw] items-center justify-center">
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-0 top-0 z-10 h-full min-h-[200px] w-1/3 min-w-[80px] cursor-w-resize"
              aria-label="Vorheriges Bild"
            />
          )}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-0 top-0 z-10 h-full min-h-[200px] w-1/3 min-w-[80px] cursor-e-resize"
              aria-label="Nächstes Bild"
            />
          )}
          <img
            src={current.url}
            alt={current.alt ?? "Albumfoto"}
            className="max-h-[75vh] max-w-full object-contain"
          />
        </div>
        {images.length > 1 && !ownerMode && (
          <p className="mt-2 rounded bg-black/60 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {images.length}
          </p>
        )}
        {ownerMode && currentOwnerPhoto && current.id !== "avatar" && (
          <div className="mt-4 w-full max-w-md space-y-3 rounded-lg border border-gray-600 bg-black/40 p-4">
            {images.length > 1 && (
              <p className="text-center text-sm text-gray-400">
                {currentIndex + 1} / {images.length}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {ownerMode.isMainAlbum && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ownerMode.onSetAsProfile(currentOwnerPhoto.id);
                  }}
                  className="inline-flex items-center gap-2 rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  <User className="h-4 w-4" />
                  Als Profilbild
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Foto wirklich löschen?")) {
                    ownerMode.onDelete(currentOwnerPhoto.id, currentOwnerPhoto.storage_path);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Löschen
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setEditTitle(currentOwnerPhoto.title ?? "");
                    setEditCaption(currentOwnerPhoto.caption ?? "");
                  }
                }}
                className="inline-flex items-center gap-2 rounded bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-500"
              >
                <Pencil className="h-4 w-4" />
                {isEditing ? "Abbrechen" : "Titel bearbeiten"}
              </button>
            </div>
            {isEditing && (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Titel"
                  className="w-full rounded border border-gray-600 bg-black/60 px-3 py-2 text-sm text-white placeholder-gray-500"
                />
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Beschreibung"
                  rows={2}
                  className="w-full resize-none rounded border border-gray-600 bg-black/60 px-3 py-2 text-sm text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ownerMode.onSaveEdit(currentOwnerPhoto.id, editTitle, editCaption);
                    setIsEditing(false);
                  }}
                  className="w-full rounded bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Speichern
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
