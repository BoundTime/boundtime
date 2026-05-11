import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Lock } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityStartForm } from "@/components/chastity/ChastityStartForm";
import { ChastityAcceptDecline } from "@/components/chastity/ChastityAcceptDecline";
import { ChastityAcceptRequestForm } from "@/components/chastity/ChastityAcceptRequestForm";
import { ChastityClaimRewardButton } from "@/components/chastity/ChastityClaimRewardButton";
import { ActiveDynamik } from "@/components/dashboard/keuschhaltung/ActiveDynamik";
import { BoundDollarsCard } from "@/components/dashboard/keuschhaltung/BoundDollarsCard";

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

  const [{ data: profile }, { data: profileFull }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("profiles").select("bound_dollars").eq("id", user.id).single(),
  ]);

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
  const { data: partnerProfiles } = await supabase
    .from("profiles")
    .select("id, nick")
    .in("id", Array.from(partnerIds));

  const nickById = new Map(partnerProfiles?.map((p) => [p.id, p.nick]) ?? []);

  const asDom = (arrangements ?? []).filter(
    (a) => a.dom_id === user.id && ["active", "paused", "pending", "requested_by_sub"].includes(a.status)
  );
  const asSub = (arrangements ?? []).filter(
    (a) => a.sub_id === user.id && (a.status === "active" || a.status === "paused")
  );

  const subArrangementIds = asSub.map((a) => a.id);
  const { data: pendingTasksData } =
    subArrangementIds.length > 0
      ? await supabase
          .from("chastity_tasks")
          .select("arrangement_id, title")
          .in("arrangement_id", subArrangementIds)
          .eq("status", "pending")
      : { data: [] };
  const openTasksByArrangement = new Map<string, string[]>();
  for (const t of pendingTasksData ?? []) {
    const list = openTasksByArrangement.get(t.arrangement_id) ?? [];
    list.push(t.title);
    openTasksByArrangement.set(t.arrangement_id, list);
  }
  const canStartAsDom = profile?.role === "Dom" || profile?.role === "Switcher";
  const offerSubNick = offerSubId ? nickById.get(offerSubId) ?? null : null;

  // Find active sub arrangement for countdown
  const activeSubArr = asSub.find((a) => a.status === "active") ?? null;
  let activeDynamikProps = null;
  if (activeSubArr?.locked_at) {
    const daysBound = Math.max(
      0,
      Math.floor((Date.now() - new Date(activeSubArr.locked_at).getTime()) / 86400000)
    );
    const daysTotal = activeSubArr.reward_goal_bound_dollars
      ? Math.round(activeSubArr.reward_goal_bound_dollars / 10)
      : 30;
    const targetDate = new Date(
      new Date(activeSubArr.locked_at).getTime() + daysTotal * 86400000
    ).toISOString();
    activeDynamikProps = {
      arrangementId: activeSubArr.id,
      partnerNick: nickById.get(activeSubArr.dom_id) ?? "Dom",
      lockedAt: activeSubArr.locked_at,
      daysTotal,
      daysBound,
      rewardDescription: activeSubArr.reward_description ?? null,
      rewardGoalBd: activeSubArr.reward_goal_bound_dollars ?? 0,
      currentBd: activeSubArr.bound_dollars ?? 0,
      targetDate,
    };
  }

  const boundDollars = Math.round(Number(profileFull?.bound_dollars ?? 0));

  // Timeline events from ended arrangements
  const endedArrangements = (arrangements ?? []).filter((a) => a.status === "ended").slice(0, 5);

  const pendingIncoming = (arrangements ?? []).filter(
    (a) => a.sub_id === user.id && a.status === "pending"
  );

  return (
    <Container className="py-6 md:py-8">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[18px] font-medium text-white">Keuschhaltung</h1>
        {canStartAsDom && (
          <a
            href="#neue-dynamik"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#7B1111" }}
          >
            <Plus size={14} strokeWidth={2} />
            Neue Dynamik
          </a>
        )}
      </div>

      {/* Zwei-Spalten-Layout */}
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        {/* Linke Haupt-Spalte */}
        <div className="space-y-5">
          {/* Eingehende Anfragen (Sub-Sicht: Dom-Anfragen an dich) */}
          {pendingIncoming.length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-3">Anfragen an dich</h2>
              <ul className="space-y-3">
                {pendingIncoming.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-white">
                        Von {nickById.get(a.dom_id) ?? "?"}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        Ziel: {a.reward_goal_bound_dollars} BD · {a.reward_description || "—"}
                      </p>
                    </div>
                    <ChastityAcceptDecline arrangementId={a.id} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dom: Sub bittet um Keuschhaltung */}
          {asDom.filter((a) => a.status === "requested_by_sub").length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-3">Bitten um Keuschhaltung</h2>
              <ul className="space-y-3">
                {asDom
                  .filter((a) => a.status === "requested_by_sub")
                  .map((a) => (
                    <li key={a.id} className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[13px] font-medium text-white mb-2">
                        {nickById.get(a.sub_id) ?? "?"} bittet um Keuschhaltung
                      </p>
                      <ChastityAcceptRequestForm arrangementId={a.id} subNick={nickById.get(a.sub_id) ?? "?"} />
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Aktive Dynamik (Sub-Sicht mit Countdown) */}
          {activeDynamikProps ? (
            <ActiveDynamik {...activeDynamikProps} />
          ) : asSub.length === 0 && asDom.length === 0 && pendingIncoming.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-lg p-12 text-center"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Lock size={28} className="text-gray-600 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-medium text-white">Keine aktive Dynamik</p>
              <p className="text-[12px] text-gray-500 mt-1">
                {canStartAsDom ? "Starte unten eine neue Dynamik." : "Du wirst hier eine Dynamik sehen, wenn ein Dom dich einlädt."}
              </p>
            </div>
          ) : null}

          {/* Dom-Sicht: Aktive Vereinbarungen */}
          {asDom.filter((a) => a.status === "active" || a.status === "paused").length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-3">Ihre Dynamiken</h2>
              <ul className="space-y-3">
                {asDom.filter((a) => a.status === "active" || a.status === "paused").map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="text-[13px] font-medium text-white">
                        {nickById.get(a.sub_id) ?? "?"}{" "}
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(123,17,17,0.1)", color: "#7B1111" }}>
                          {STATUS_LABELS[a.status]}
                        </span>
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {a.bound_dollars} / {a.reward_goal_bound_dollars} BD
                        {a.reward_description ? ` · ${a.reward_description}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/keuschhaltung/${a.id}`}
                      className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:opacity-90"
                      style={{ background: "#7B1111" }}
                    >
                      Aufgaben
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sub mit aktiver Dynamik: alle asSub inkl. Claim-Button */}
          {asSub.length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-3">Deine Dynamiken</h2>
              <ul className="space-y-3">
                {asSub.map((a) => {
                  const openTasks = openTasksByArrangement.get(a.id) ?? [];
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <p className="text-[13px] font-medium text-white">
                          Mit {nickById.get(a.dom_id) ?? "?"}{" "}
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(123,17,17,0.1)", color: "#7B1111" }}>
                            {STATUS_LABELS[a.status]}
                          </span>
                        </p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          {a.bound_dollars} / {a.reward_goal_bound_dollars} BD
                          {a.reward_description ? ` · ${a.reward_description}` : ""}
                        </p>
                        {openTasks.length > 0 && (
                          <p className="mt-1 text-[11px] text-amber-400/80">
                            Offen: {openTasks.slice(0, 2).join(", ")}
                            {openTasks.length > 2 && ` +${openTasks.length - 2}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/keuschhaltung/${a.id}`} className="rounded-md px-3 py-1.5 text-[12px] font-medium text-white" style={{ background: "#7B1111" }}>
                          Details
                        </Link>
                        {a.bound_dollars >= a.reward_goal_bound_dollars && (
                          <ChastityClaimRewardButton arrangementId={a.id} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Verlauf (Timeline) */}
          {endedArrangements.length > 0 && (
            <div
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-4">Verlauf</h2>
              <div className="relative pl-5 space-y-4">
                {endedArrangements.map((a, i) => (
                  <div key={a.id} className="relative">
                    {/* Linie */}
                    {i < endedArrangements.length - 1 && (
                      <div
                        className="absolute left-[-12px] top-4 bottom-[-16px] w-px"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      />
                    )}
                    {/* Dot */}
                    <div
                      className="absolute left-[-16px] top-1.5 rounded-full"
                      style={{ width: 10, height: 10, background: "rgba(255,255,255,0.2)" }}
                    />
                    <p className="text-[13px] text-white">
                      Dynamik mit {nickById.get(a.sub_id === user.id ? a.dom_id : a.sub_id) ?? "?"} beendet
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString("de-DE")} · {a.bound_dollars ?? 0} BD erreicht
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neue Dynamik Formular */}
          {canStartAsDom && (
            <div
              id="neue-dynamik"
              className="rounded-lg p-5"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-[14px] font-medium text-white mb-1">
                {offerSubId && offerSubNick ? `Dynamik mit ${offerSubNick} starten` : "Neue Dynamik starten"}
              </h2>
              <p className="text-[12px] text-gray-500 mb-4">
                {offerSubId && offerSubNick
                  ? "Lege Belohnungsziel und Belohnung fest."
                  : "Gib den Nick des Sub ein und lege Belohnungsziel sowie Belohnung fest."}
              </p>
              <ChastityStartForm initialSubId={offerSubId ?? undefined} initialSubNick={offerSubNick ?? undefined} />
            </div>
          )}
        </div>

        {/* Rechte Spalte */}
        <div className="space-y-4">
          <BoundDollarsCard balance={boundDollars} />

          {/* Aktive Dynamik Details */}
          {activeSubArr && (
            <div
              className="rounded-lg p-4"
              style={{ background: "var(--card, #1a1a1a)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="text-[13px] font-medium text-white mb-3">Dynamik-Details</h3>
              <div className="space-y-2">
                {[
                  ["Partner", nickById.get(activeSubArr.dom_id) ?? "?"],
                  ["Status", STATUS_LABELS[activeSubArr.status] ?? activeSubArr.status],
                  [
                    "BD bei Erfüllung",
                    <span key="bd" style={{ color: "#8A6D2E" }}>{activeSubArr.reward_goal_bound_dollars} BD</span>,
                  ],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-2 pb-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[12px] text-gray-500">{label}</span>
                    <span className="text-[12px] font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
