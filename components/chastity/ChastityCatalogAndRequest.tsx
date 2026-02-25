"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CatalogItem = {
  id: string;
  reward_template_id: string | null;
  custom_title: string | null;
  price_bound_dollars: number;
  requires_unlock: boolean;
  chastity_reward_templates?: { title: string } | null;
};

export function ChastityCatalogAndRequest({
  arrangementId,
  boundDollars,
}: {
  arrangementId: string;
  boundDollars: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("chastity_catalog_items")
      .select("id, reward_template_id, custom_title, price_bound_dollars, requires_unlock, chastity_reward_templates(title)")
      .eq("arrangement_id", arrangementId)
      .order("price_bound_dollars")
      .then(({ data }) => setItems(data ?? []));
  }, [arrangementId]);

  async function requestItem(itemId: string) {
    setError(null);
    setLoading(itemId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: insertErr } = await supabase.from("chastity_reward_requests").insert({
      arrangement_id: arrangementId,
      catalog_item_id: itemId,
      requested_by: user.id,
      status: "pending",
    });
    setLoading(null);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    router.refresh();
  }

  const displayTitle = (item: CatalogItem) =>
    item.custom_title ?? (item.chastity_reward_templates as { title?: string } | null)?.title ?? "-";

  if (items.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Belohnungskatalog</h3>
      <p className="mt-1 text-sm text-gray-500">
        Dein Kontostand: <span className="font-medium text-white">{boundDollars} BD</span>
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const canAfford = boundDollars >= item.price_bound_dollars;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-700 bg-card px-4 py-2"
            >
              <div>
                <span className="text-white">{displayTitle(item)}</span>
                {item.requires_unlock && (
                  <span className="ml-2 text-xs text-amber-400">(Unlock erforderlich)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{item.price_bound_dollars} BD</span>
                <button
                  type="button"
                  onClick={() => requestItem(item.id)}
                  disabled={!canAfford || loading !== null}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading === item.id ? "…" : "Anfordern"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
