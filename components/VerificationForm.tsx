"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VerificationForm({ userId, hasExisting }: { userId: string; hasExisting: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Bitte ein Foto auswählen.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Bitte nur Bilddateien (JPG, PNG, WebP) verwenden.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/verification.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("verifications")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError(uploadErr.message);
      setLoading(false);
      return;
    }

    const { error: upsertErr } = await supabase
      .from("verifications")
      .upsert(
        { user_id: userId, photo_path: path, status: "pending", submitted_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (upsertErr) {
      setError(upsertErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
      )}

      <div>
        <label htmlFor="verification-photo" className="mb-1 block text-sm text-gray-300">
          Foto mit Personalausweis
        </label>
        <input
          id="verification-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-400 file:mr-2 file:rounded file:border-0 file:bg-accent file:px-3 file:py-2 file:text-white file:hover:bg-accent-hover"
        />
        <p className="mt-1 text-xs text-gray-500">Name und Geburtsdatum müssen lesbar sein. Max. 10 MB.</p>
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Wird gesendet …" : hasExisting ? "Erneut einreichen" : "Antrag senden"}
      </button>
    </form>
  );
}
