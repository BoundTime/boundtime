"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ChastityCompleteTaskWithPhoto({
  taskId,
  arrangementId,
  requiresPhoto,
}: {
  taskId: string;
  arrangementId: string;
  requiresPhoto: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Bitte nur Bilddateien (JPG, PNG, GIF, WebP).");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function complete() {
    setError(null);
    if (requiresPhoto && !imageFile) {
      setError("Bitte Foto-Beweis hochladen.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    let proofPath: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${arrangementId}/${taskId}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("task-proofs")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (uploadErr) {
        setError(uploadErr.message);
        setLoading(false);
        return;
      }
      proofPath = path;
    }
    const { error: rpcErr } = await supabase.rpc("complete_chastity_task", {
      p_task_id: taskId,
      p_proof_photo_url: proofPath,
    });
    setLoading(false);
    if (!rpcErr) router.refresh();
    else setError(rpcErr.message);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {requiresPhoto && (
        <div className="w-full">
          <label className="mb-1 block text-xs text-gray-500">Foto-Beweis (Pflicht)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:rounded file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Vorschau"
              className="mt-2 max-h-32 rounded-lg border border-gray-700 object-cover"
            />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={complete}
        disabled={loading || (requiresPhoto && !imageFile)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "…" : "Als erledigt markieren"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
