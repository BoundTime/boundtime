"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DomForumPostDeleteButton({ postId, imageUrl }: { postId: string; imageUrl?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Beitrag wirklich löschen?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("dom_forum_posts").delete().eq("id", postId);
    if (imageUrl?.trim()) {
      await supabase.storage.from("post-images").remove([imageUrl.trim()]);
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-gray-400 hover:text-red-400 disabled:opacity-50"
      aria-label="Beitrag löschen"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
}
