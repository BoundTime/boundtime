"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PostLikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    const uid = u?.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const prevLiked = liked;
    const prevCount = count;
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", uid);
      if (error) {
        setLiked(prevLiked);
        setCount(prevCount);
      } else {
        router.refresh();
      }
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase
        .from("post_likes")
        .upsert({ post_id: postId, user_id: uid }, { onConflict: "post_id,user_id" });
      if (error) {
        setLiked(prevLiked);
        setCount(prevCount);
      } else {
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
        liked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"
      }`}
      aria-pressed={liked}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} strokeWidth={1.5} />
      <span>{count > 0 ? count : ""}</span>
      {count === 1 && <span className="sr-only">Like</span>}
      {count !== 1 && count > 0 && <span className="sr-only">Likes</span>}
    </button>
  );
}
