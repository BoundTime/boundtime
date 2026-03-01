"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { DomForumPostDeleteButton } from "@/components/dom/DomForumPostDeleteButton";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_nick: string;
  author_avatar_url: string | null;
};

export function DomForumThread({
  posts,
  currentUserId,
  topicId,
}: {
  posts: Post[];
  currentUserId: string;
  topicId: string;
}) {
  const supabase = createClient();

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700 bg-card p-8 text-center">
        <p className="text-gray-500">Noch keine Beiträge in diesem Thema.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="overflow-hidden rounded-xl border border-gray-700 bg-card shadow-sm">
          <div className="flex items-start gap-4 p-4">
            <Link href={`/dashboard/entdecken/${post.author_id}`} className="shrink-0">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-700 bg-background">
                {post.author_avatar_url ? (
                  <img src={post.author_avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-base font-semibold text-accent">
                    {(post.author_nick ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/entdecken/${post.author_id}`}
                    className="font-medium text-white hover:text-accent"
                  >
                    {post.author_nick}
                  </Link>
                  <VerifiedBadge size={14} showLabel />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatTime(new Date(post.created_at))}</span>
                  {post.author_id === currentUserId && (
                    <DomForumPostDeleteButton postId={post.id} imageUrl={post.image_url} />
                  )}
                </div>
              </div>
              <div className="mt-1">
                <p className="whitespace-pre-wrap text-gray-300">{post.content}</p>
                {post.image_url && (
                  <div className="mt-3 overflow-hidden rounded-lg">
                    <img
                      src={
                        supabase.storage.from("post-images").getPublicUrl(post.image_url).data.publicUrl
                      }
                      alt=""
                      className="max-h-80 w-auto max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatTime(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return d.toLocaleDateString("de-DE");
}
