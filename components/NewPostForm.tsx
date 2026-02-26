"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { POST_CONTENT_MAX } from "@/types";
import { ImagePlus } from "lucide-react";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

export function NewPostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nick, setNick] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nick, avatar_url, avatar_photo_id")
        .eq("id", user.id)
        .single();
      setNick(data?.nick ?? null);
      const url = data
        ? await resolveProfileAvatarUrl(
            { avatar_url: data.avatar_url, avatar_photo_id: data.avatar_photo_id },
            supabase
          )
        : null;
      setAvatarUrl(url);
    });
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Bitte nur Bilddateien (JPG, PNG, GIF, WebP) wählen.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimContent = content.trim();
    if (!trimContent) {
      setError("Bitte Text eingeben.");
      return;
    }
    if (trimContent.length > POST_CONTENT_MAX) {
      setError(`Maximal ${POST_CONTENT_MAX} Zeichen.`);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setLoading(false);
      return;
    }
    const { data: post, error: insertErr } = await supabase
      .from("posts")
      .insert({ author_id: user.id, content: trimContent })
      .select("id")
      .single();
    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }
    if (imageFile && post?.id) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${post.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("post-images")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
      if (!uploadErr) {
        await supabase.from("posts").update({ image_url: path }).eq("id", post.id);
      }
    }
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setLoading(false);
    router.refresh();
  }

  const initials = (nick ?? "?").slice(0, 1).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-700 bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-700 bg-background">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-accent">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was möchtest du teilen?"
            maxLength={POST_CONTENT_MAX}
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-600 bg-background px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">
              <ImagePlus className="h-4 w-4" />
              <span>Bild hinzufügen</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-gray-500">
              {content.length}/{POST_CONTENT_MAX}
            </span>
            <button
              type="submit"
              disabled={loading}
              className="ml-auto rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "…" : "Posten"}
            </button>
          </div>
          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img src={imagePreview} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -right-1 -top-1 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-white hover:bg-gray-700"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
