import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityStartForm } from "@/components/chastity/ChastityStartForm";
import { ChastityAcceptDecline } from "@/components/chastity/ChastityAcceptDecline";
import { ChastityAcceptRequestForm } from "@/components/chastity/ChastityAcceptRequestForm";
import { ChastityClaimRewardButton } from "@/components/chastity/ChastityClaimRewardButton";

const STATUS_LABELS: Record<string, string> = {
  pending: "Anfrage",
  active: "Aktiv",
  paused: "Pausiert",
  ended: "Beendet",
  requested_by_sub: "Bittet um Keuschhaltung",
};

export default async function KeuschhaltungPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const offerSubId = params.offer ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: arrangements } = await supabase
    .from("chastity_arrangements")
    .select("*")
    .or(`dom_id.eq.${user.id},sub_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const partnerIds = new Set<string>();
  arrangements?.forEach((a) => {
    partnerIds.add(a.dom_id);
    partnerIds.add(a.sub_id);
  });
  if (offerSubId) partnerIds.add(offerSubId);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nick")
    .in("id", Array.from(partnerIds));

  const nickById = new Map(profiles?.map((p) => [p.id, p.nick]) ?? []);

  const asDom = (arrangements ?? []).filter(
    (a) => a.dom_id === user.id && ["active", "paused", "pending", "requested_by_sub"].includes(a.status)
  );
  const asSub = (arrangements ?? []).filter(
    (a) => a.sub_id === user.id && (a.status === "active" || a.status === "paused")
  );

  const subArrangementIds = asSub
    .filter((a) => a.status === "active" || a.status === "paused")
    .map((a) => a.id);
  const { data: pendingTasksByArrangement } =
    subArrangementIds.length > 0
      ? await supabase
          .from("chastity_tasks")
          .select("arrangement_id, title")
          .in("arrangement_id", subArrangementIds)
          .eq("status", "pending")
      : { data: [] };
  const openTasksByArrangement = new Map<string, string[]>();
  for (const t of pendingTasksByArrangement ?? []) {
    const list = openTasksByArrangement.get(t.arrangement_id) ?? [];
    list.push(t.title);
    openTasksByArrangement.set(t.arrangement_id, list);
  }
  const canStartAsDom = profile?.role === "Dom" || profile?.role === "Switcher";

  const offerSubNick = offerSubId ? nickById.get(offerSubId) ?? null : null;

  return (
    <Container className="py-16">
      <div className="overflow-hidden rounded-t-xl border border-b-0 border-gray-700 bg-gradient-to-b from-gray-800/80 to-card px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Keuschhaltung</h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            ← MyBound
          </Link>
        </div>
      </div>

      <div className="rounded-b-xl border border-t-0 border-gray-700 bg-card p-6 shadow-sm">
      {/* Sub bittet um Keuschhaltung (Dom) */}
      {asDom.filter((a) => a.status === "requested_by_sub").length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">Ihre Anfragen: Bitten um Keuschhaltung</h2>
          <ul className="mt-4 space-y-4">
            {asDom
              .filter((a) => a.status === "requested_by_sub")
              .map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-gray-700 bg-background p-4"
                >
                  <p className="font-medium text-white">
                    {nickById.get(a.sub_id) ?? "?"} bittet um Keuschhaltung
                  </p>
                  <ChastityAcceptRequestForm
                    arrangementId={a.id}
                    subNick={nickById.get(a.sub_id) ?? "?"}
                  />
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Dynamik starten (Dom) */}
      {canStartAsDom && (
        <div className="mb-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">
            {offerSubId && offerSubNick
              ? `Dynamik mit ${offerSubNick} starten`
              : "Neue Dynamik starten"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {offerSubId && offerSubNick
              ? "Lege Belohnungsziel und Belohnung fest."
              : "Gib den Nick des Sub ein und lege Belohnungsziel sowie Belohnung fest."}
          </p>
          <div className="mt-4">
            <ChastityStartForm
              initialSubId={offerSubId ?? undefined}
              initialSubNick={offerSubNick ?? undefined}
            />
          </div>
        </div>
      )}

      {/* Als Sub: Eingehende Anfragen (asSub hat nur active/paused; pending holen wir aus arrangements) */}
      {arrangements?.filter((a) => a.sub_id === user.id && a.status === "pending").length ? (
        <div className="mb-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">Anfragen an dich</h2>
          <ul className="mt-4 space-y-4">
            {(arrangements ?? [])
              .filter((a) => a.sub_id === user.id && a.status === "pending")
              .map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-700 bg-background p-4"
                >
                  <div>
                    <p className="font-medium text-white">
                      Von {nickById.get(a.dom_id) ?? "?"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Ziel: {a.reward_goal_bound_dollars} BD · {a.reward_description || "—"}
                    </p>
                  </div>
                  <ChastityAcceptDecline arrangementId={a.id} />
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {/* Meine Vereinbarungen (Dom) */}
      {asDom.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">Ihre Dynamiken</h2>
          <ul className="mt-4 space-y-4">
            {asDom.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-gray-700 bg-background p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      Mit {nickById.get(a.sub_id) ?? "?"} · {STATUS_LABELS[a.status] ?? a.status}
                    </p>
                    <p className="text-sm text-gray-400">
                      {a.bound_dollars} / {a.reward_goal_bound_dollars} BD
                      {a.reward_description ? ` · ${a.reward_description}` : ""}
                    </p>
                  </div>
                  {(a.status === "active" || a.status === "paused") && (
                    <Link
                      href={`/dashboard/keuschhaltung/${a.id}`}
                      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                    >
                      Aufgaben verwalten
                    </Link>
                  )}
                  {a.status === "pending" && (
                    <span className="text-sm text-gray-500">Warte auf Annahme durch Sub</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meine Vereinbarungen (Sub) – nur active/paused */}
      {asSub.length > 0 && (
        <div className="mb-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white">Deine Dynamiken (als Sub)</h2>
          <ul className="mt-4 space-y-4">
            {asSub.map((a) => {
                const openTasks = openTasksByArrangement.get(a.id) ?? [];
                return (
                <li
                  key={a.id}
                  className="rounded-lg border border-gray-700 bg-background p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">
                        Mit {nickById.get(a.dom_id) ?? "?"} · {STATUS_LABELS[a.status] ?? a.status}
                      </p>
                      <p className="text-sm text-gray-400">
                        {a.bound_dollars} / {a.reward_goal_bound_dollars} BD
                        {a.reward_description ? ` · ${a.reward_description}` : ""}
                      </p>
                      {openTasks.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">
                          Noch offen: {openTasks.slice(0, 3).join(", ")}
                          {openTasks.length > 3 && ` (+${openTasks.length - 3} weitere)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(a.status === "active" || a.status === "paused") && (
                        <>
                          <Link
                            href={`/dashboard/keuschhaltung/${a.id}`}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                          >
                            Details & Aufgaben
                          </Link>
                          {a.bound_dollars >= a.reward_goal_bound_dollars && (
                            <ChastityClaimRewardButton arrangementId={a.id} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
                );
              })}
          </ul>
        </div>
      )}

      {!arrangements?.length && (
        <p className="text-center text-gray-500">
          Noch keine Keuschhaltungs-Dynamiken.{" "}
          {canStartAsDom && "Starte oben eine neue Dynamik."}
        </p>
      )}
      </div>
    </Container>
  );
}
