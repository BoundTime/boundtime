"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ProfileLikeButton({
  profileId,
  initialLiked,
  initialCount,
}: {
  profileId: string;
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
      const { error } = await supabase.from("profile_likes").delete().eq("profile_id", profileId).eq("liker_id", uid);
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
        .from("profile_likes")
        .upsert({ profile_id: profileId, liker_id: uid }, { onConflict: "profile_id,liker_id" });
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
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : "border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
      }`}
      aria-pressed={liked}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} strokeWidth={1.5} />
      Gefällt mir {count > 0 && `· ${count}`}
    </button>
  );
}
