"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Rule = { id: string; rule_text: string; sort_order: number };

export function ChastityRules({
  arrangementId,
  isDom,
}: {
  arrangementId: string;
  isDom: boolean;
}) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient()
      .from("chastity_rules")
      .select("id, rule_text, sort_order")
      .eq("arrangement_id", arrangementId)
      .order("sort_order")
      .then(({ data }) => setRules(data ?? []));
  }, [arrangementId]);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newRule.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase
      .from("chastity_rules")
      .insert({
        arrangement_id: arrangementId,
        rule_text: newRule.trim(),
        created_by: user.id,
      })
      .select("id, rule_text, sort_order")
      .single();
    setNewRule("");
    setLoading(false);
    if (inserted) setRules((prev) => [...prev, inserted]);
  }

  async function deleteRule(id: string) {
    const supabase = createClient();
    await supabase.from("chastity_rules").delete().eq("id", id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  if (rules.length === 0 && !isDom) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
      <h3 className="text-lg font-semibold text-white">Regeln der Dom</h3>
      {rules.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rules.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300"
            >
              {r.rule_text}
              {isDom && (
                <button
                  type="button"
                  onClick={() => deleteRule(r.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Entfernen
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Noch keine Regeln.</p>
      )}
      {isDom && (
        <form onSubmit={addRule} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="z.B. Täglich um 8 Uhr Bericht"
            className="flex-1 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            disabled={loading || !newRule.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Hinzufügen
          </button>
        </form>
      )}
    </div>
  );
}
