"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RewardTemplate = {
  id: string;
  title: string;
  description: string | null;
  requires_unlock: boolean;
};

type CatalogItem = {
  id: string;
  reward_template_id: string | null;
  custom_title: string | null;
  price_bound_dollars: number;
  requires_unlock: boolean;
  chastity_reward_templates?: { title: string } | null;
};

export function ChastityCatalogManager({
  arrangementId,
  domId,
}: {
  arrangementId: string;
  domId: string;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<RewardTemplate[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [price, setPrice] = useState("50");
  const [requiresUnlock, setRequiresUnlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("chastity_reward_templates")
      .select("id, title, description, requires_unlock")
      .order("sort_order")
      .then(({ data }) => setTemplates(data ?? []));
  }, []);

  useEffect(() => {
    createClient()
      .from("chastity_catalog_items")
      .select("id, reward_template_id, custom_title, price_bound_dollars, requires_unlock, chastity_reward_templates(title)")
      .eq("arrangement_id", arrangementId)
      .order("created_at")
      .then(({ data }) => setItems(data ?? []));
  }, [arrangementId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = parseInt(price, 10);
    if (isNaN(p) || p < 0) {
      setError("Preis (BD) muss ≥ 0 sein.");
      return;
    }
    const title = templateId
      ? (templates.find((t) => t.id === templateId)?.title ?? customTitle)
      : customTitle;
    if (!title?.trim()) {
      setError("Belohnung auswählen oder Titel eingeben.");
      return;
    }
    const tpl = templates.find((t) => t.id === templateId);
    setLoading(true);
    const supabase = createClient();
    const { error: insertErr } = await supabase.from("chastity_catalog_items").insert({
      arrangement_id: arrangementId,
      reward_template_id: templateId || null,
      custom_title: templateId ? null : customTitle.trim() || null,
      price_bound_dollars: p,
      requires_unlock: tpl?.requires_unlock ?? requiresUnlock,
      created_by: domId,
    });
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setTemplateId("");
    setCustomTitle("");
    setPrice("50");
    setRequiresUnlock(false);
    router.refresh();
  }

  async function handleDelete(itemId: string) {
    const supabase = createClient();
    await supabase.from("chastity_catalog_items").delete().eq("id", itemId);
    router.refresh();
  }

  const displayTitle = (item: CatalogItem) =>
    item.custom_title ?? (item.chastity_reward_templates as { title?: string } | null)?.title ?? "-";

  return (
    <div className="rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Belohnungskatalog</h3>
      <p className="mt-1 text-sm text-gray-500">
        Belohnungen mit Preisen hinzufügen. Sub kann daraus anfordern. Preis 0 BD = Überraschungs-Geschenk.
      </p>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-700 bg-card px-4 py-2"
            >
              <span className="text-white">{displayTitle(item)}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{item.price_bound_dollars} BD</span>
                {item.requires_unlock && (
                  <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200">
                    Unlock
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Entfernen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Belohnung</label>
          <select
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              const t = templates.find((tpl) => tpl.id === e.target.value);
              if (t) setRequiresUnlock(t.requires_unlock);
            }}
            className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          >
            <option value="">Eigene Belohnung</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        {!templateId && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Titel</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
              placeholder="z.B. Massage"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs text-gray-500">Preis (BD)</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-20 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          />
        </div>
        {!templateId && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requiresUnlock}
              onChange={(e) => setRequiresUnlock(e.target.checked)}
              className="rounded border-gray-600"
            />
            <span className="text-xs text-gray-500">Unlock erforderlich</span>
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "…" : "Hinzufügen"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
