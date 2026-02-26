"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({
  followingId,
  initialIsFollowing,
}: {
  followingId: string;
  initialIsFollowing: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Nicht angemeldet.");
        return;
      }
      if (user.id === followingId) return;
      if (isFollowing) {
        const { error: err } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", followingId);
        if (err) {
          setError(err.message);
          return;
        }
        setIsFollowing(false);
      } else {
        const { error: err } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: followingId,
        });
        if (err) {
          setError(err.message);
          return;
        }
        setIsFollowing(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`min-h-[44px] flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 sm:py-2 ${
          isFollowing
            ? "border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
            : "bg-accent text-white hover:bg-accent-hover"
        }`}
      >
        {loading ? "…" : isFollowing ? "Entfolgen" : "Folgen"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
