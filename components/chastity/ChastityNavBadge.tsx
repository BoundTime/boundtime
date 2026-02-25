"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ChastityNavBadge({
  onClick,
  className = "text-sm text-gray-300 transition-colors hover:text-white",
}: {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
} = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("chastity_arrangements")
        .select("id")
        .or(`dom_id.eq.${user.id},sub_id.eq.${user.id}`)
        .eq("status", "active")
        .then(({ data: arrs }) => {
          if (!arrs?.length) { setCount(0); return; }
          const arrIds = arrs.map((a) => a.id);
          Promise.all([
            supabase.from("chastity_reward_requests").select("id", { count: "exact", head: true }).in("arrangement_id", arrIds).eq("status", "pending"),
            supabase.from("chastity_random_checks").select("id", { count: "exact", head: true }).in("arrangement_id", arrIds).eq("status", "pending"),
          ]).then(([r1, r2]) => {
            setCount((r1.count ?? 0) + (r2.count ?? 0));
          });
        });
    });
  }, []);

  return (
    <Link href="/dashboard/keuschhaltung" onClick={(e) => onClick?.(e)} className={`relative flex items-center gap-2 ${className}`}>
      <LockKeyhole className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
      Keuschhaltung
      {count > 0 && (
        <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
