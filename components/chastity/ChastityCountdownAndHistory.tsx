"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type CatalogItem = { price_bound_dollars: number };
type RewardRequest = {
  approved_at: string;
  chastity_catalog_items?: { custom_title: string | null; chastity_reward_templates?: { title: string } | null } | null;
};

export function ChastityCountdownAndHistory({
  arrangementId,
  boundDollars,
  rewardGoalBoundDollars,
}: {
  arrangementId: string;
  boundDollars: number;
  rewardGoalBoundDollars: number;
}) {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [history, setHistory] = useState<RewardRequest[]>([]);

  useEffect(() => {
    createClient()
      .from("chastity_catalog_items")
      .select("price_bound_dollars")
      .eq("arrangement_id", arrangementId)
      .order("price_bound_dollars")
      .then(({ data }) => setCatalogItems(data ?? []));
  }, [arrangementId]);

  useEffect(() => {
    createClient()
      .from("chastity_reward_requests")
      .select("approved_at, chastity_catalog_items(custom_title, chastity_reward_templates(title))")
      .eq("arrangement_id", arrangementId)
      .eq("status", "approved")
      .not("approved_at", "is", null)
      .order("approved_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        const raw = data ?? [];
        const normalized: RewardRequest[] = raw.map((r: Record<string, unknown>) => {
          const items = r.chastity_catalog_items;
          const ci = Array.isArray(items) ? items[0] : items;
          const templates = ci && typeof ci === "object" && "chastity_reward_templates" in ci ? (ci as { chastity_reward_templates: unknown }).chastity_reward_templates : null;
          const tpl = Array.isArray(templates) ? templates[0] : templates;
          return {
            approved_at: r.approved_at,
            chastity_catalog_items: ci ? { custom_title: (ci as { custom_title?: unknown }).custom_title ?? null, chastity_reward_templates: tpl && typeof tpl === "object" ? (tpl as { title?: string }) : null } : null,
          } as RewardRequest;
        });
        setHistory(normalized);
      });
  }, [arrangementId]);

  const nextPrice =
    catalogItems.length > 0
      ? Math.min(...catalogItems.map((c) => c.price_bound_dollars).filter((p) => p > 0))
      : rewardGoalBoundDollars;
  const needed = Math.max(0, nextPrice - boundDollars);

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Countdown & Belohnungs-Historie</h3>
      <p className="mt-2 rounded-lg bg-accent/20 px-3 py-2 text-sm font-medium text-accent">
        Noch {needed} BD bis zur nächsten Belohnung
      </p>
      {history.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">Letzte Belohnungen</p>
          <ul className="space-y-1 text-sm text-gray-300">
            {history.map((h, i) => (
              <li key={i}>
                {new Date(h.approved_at!).toLocaleDateString("de-DE")} ·{" "}
                {h.chastity_catalog_items?.custom_title ??
                  (h.chastity_catalog_items?.chastity_reward_templates as { title?: string } | null)
                    ?.title ??
                  "Belohnung"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
