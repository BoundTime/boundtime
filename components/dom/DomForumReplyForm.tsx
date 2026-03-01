"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRestriction } from "@/lib/restriction-context";
import { ImagePlus } from "lucide-react";

export function DomForumReplyForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const { canWrite, requestUnlock } = useRestriction();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) {
      requestUnlock();
      return;
    }
    setError(null);
    const trimContent = content.trim();
    if (!trimContent) {
      setError("Bitte Text eingeben.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setLoading(false);
      return;
    }
    let imagePath: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      imagePath = `dom-forum/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("post-images")
        .upload(imagePath, imageFile, { upsert: true, contentType: imageFile.type });
      if (uploadErr) {
        setError(uploadErr.message);
        setLoading(false);
        return;
      }
    }
    const { error: insertErr } = await supabase.from("dom_forum_posts").insert({
      topic_id: topicId,
      author_id: user.id,
      content: trimContent,
      image_url: imagePath,
    });
    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setLoading(false);
    router.refresh();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Deine Antwort …"
        maxLength={2000}
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-600 bg-background px-4 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">
            <ImagePlus className="h-4 w-4" />
            <span>Bild</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-gray-500">{content.length}/2000</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Wird gesendet …" : "Antworten"}
        </button>
      </div>
      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="" className="h-20 w-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            className="absolute -right-1 -top-1 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-white hover:bg-gray-700"
          >
            ×
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
