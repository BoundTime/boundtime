"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PostDeleteButton({
  postId,
  imageUrl,
  onDeleted,
}: {
  postId: string;
  imageUrl?: string | null;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Post wirklich löschen?")) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("author_id", user.id);
    if (error) {
      setLoading(false);
      return;
    }
    if (imageUrl?.trim()) {
      await supabase.storage.from("post-images").remove([imageUrl.trim()]);
    }
    onDeleted?.();
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
      aria-label="Post löschen"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}
