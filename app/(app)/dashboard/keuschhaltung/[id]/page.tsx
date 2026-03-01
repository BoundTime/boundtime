import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ChastityAddTaskForm } from "@/components/chastity/ChastityAddTaskForm";
import { ChastityCompleteTaskWithPhoto } from "@/components/chastity/ChastityCompleteTaskWithPhoto";
import { ChastityClaimRewardButton } from "@/components/chastity/ChastityClaimRewardButton";
import { ChastityPenaltyButton } from "@/components/chastity/ChastityPenaltyButton";
import { ChastityConfirmTaskButton } from "@/components/chastity/ChastityConfirmTaskButton";
import { ChastityLockDisplay } from "@/components/chastity/ChastityLockDisplay";
import { KeuschhaltungDetailTabs } from "@/components/chastity/KeuschhaltungDetailTabs";
import { ChastityCatalogAndRequest } from "@/components/chastity/ChastityCatalogAndRequest";
import { ChastityPendingRequests } from "@/components/chastity/ChastityPendingRequests";
import { ChastityUnlockLog } from "@/components/chastity/ChastityUnlockLog";
import { ChastityStreakAndBadges } from "@/components/chastity/ChastityStreakAndBadges";
import { ChastityRules } from "@/components/chastity/ChastityRules";
import { ChastityDailyCheckin } from "@/components/chastity/ChastityDailyCheckin";
import { ChastityCheckinsOverview } from "@/components/chastity/ChastityCheckinsOverview";
import { ChastityRandomCheck } from "@/components/chastity/ChastityRandomCheck";
import { ChastityActivityTimeline } from "@/components/chastity/ChastityActivityTimeline";
import { ChastityCalendarList } from "@/components/chastity/ChastityCalendarList";
import { BoundDollarsProgress } from "@/components/chastity/BoundDollarsProgress";
import { EndConnectionButton } from "@/components/chastity/EndConnectionButton";

const STATUS_LABELS: Record<string, string> = {
  pending: "Offen",
  awaiting_confirmation: "Wartet auf Dom-Bestätigung",
  completed: "Erledigt",
  missed: "Verpasst",
  cancelled: "Abgebrochen",
  failed: "Nicht erfüllt",
  overdue: "Überfällig",
};

export default async function KeuschhaltungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: arrangement } = await supabase
    .from("chastity_arrangements")
    .select("*")
    .eq("id", id)
    .single();

  if (!arrangement || (arrangement.dom_id !== user.id && arrangement.sub_id !== user.id)) {
    notFound();
  }

  const { data: tasks } = await supabase
    .from("chastity_tasks")
    .select("*")
    .eq("arrangement_id", id)
    .order("due_date", { ascending: true });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nick, gender")
    .in("id", [arrangement.dom_id, arrangement.sub_id]);
  const profileById = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const domProfile = profileById.get(arrangement.dom_id);
  const subProfile = profileById.get(arrangement.sub_id);
  const domNick = domProfile?.nick ?? "?";
  const subNick = subProfile?.nick ?? "?";
  const domGender = domProfile?.gender ?? null;

  const isDom = arrangement.dom_id === user.id;
  const isSub = arrangement.sub_id === user.id;

  let activeConnectionId: string | null = null;
  if (arrangement.status === "active" || arrangement.status === "paused") {
    const { data: conn } = await supabase
      .from("connections")
      .select("id")
      .eq("sub_id", arrangement.sub_id)
      .eq("dom_id", arrangement.dom_id)
      .eq("status", "active")
      .maybeSingle();
    activeConnectionId = conn?.id ?? null;
  }
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Container className="py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard/keuschhaltung" className="text-sm text-gray-400 hover:text-white">
          ← Keuschhaltung
        </Link>
      </div>

      {/* Für Dom: Entsperren/Sperren und Verschlossendauer ganz oben */}
      {arrangement.status === "active" && isDom && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-400">Schloss-Status · Verschlossendauer</h2>
          <ChastityLockDisplay
            arrangementId={arrangement.id}
            lockedAt={arrangement.locked_at}
            isDom={isDom}
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-white">
          {isDom
            ? `Dein Keuschling: ${subNick}`
            : domGender === "Frau"
              ? `Deine Keyholderin: ${domNick}`
              : `Dein Keyholder: ${domNick}`}
        </h1>
        <ChastityStreakAndBadges
          arrangementId={arrangement.id}
          currentStreakDays={arrangement.current_streak_days ?? 0}
          longestStreakDays={arrangement.longest_streak_days ?? 0}
        />
        {activeConnectionId && (
          <div className="mt-4">
            <EndConnectionButton connectionId={activeConnectionId} isSub={isSub} />
          </div>
        )}
        <div className="mt-2">
          <BoundDollarsProgress
            boundDollars={arrangement.bound_dollars ?? 0}
            rewardGoalBoundDollars={arrangement.reward_goal_bound_dollars}
            showLabel={true}
          />
          {arrangement.reward_description && (
            <p className="mt-1 text-sm text-gray-400">Belohnung: {arrangement.reward_description}</p>
          )}
        </div>
        {arrangement.status === "active" && isSub && arrangement.bound_dollars >= arrangement.reward_goal_bound_dollars && (
          <div className="mt-4">
            <ChastityClaimRewardButton arrangementId={arrangement.id} />
          </div>
        )}
        {arrangement.status === "active" && isDom && (
          <div className="mt-4 space-y-4">
            <ChastityPendingRequests arrangementId={arrangement.id} />
            <div className="rounded-xl border border-gray-700 bg-background/50 p-4">
              <h2 className="text-base font-semibold text-white">Aufgabe hinzufügen</h2>
              <ChastityAddTaskForm arrangementId={arrangement.id} domId={user.id} />
            </div>
          </div>
        )}
        {arrangement.status === "active" && (
          <>
            <ChastityRules arrangementId={arrangement.id} isDom={isDom} />
            {isDom && (
              <ChastityCheckinsOverview arrangementId={arrangement.id} />
            )}
            <ChastityRandomCheck arrangementId={arrangement.id} isDom={isDom} />
            <ChastityActivityTimeline arrangementId={arrangement.id} />
            <ChastityCalendarList tasks={tasks ?? []} />
            <ChastityDailyCheckin
              arrangementId={arrangement.id}
              subId={arrangement.sub_id}
              isSub={isSub}
            />
          </>
        )}
        {arrangement.status === "active" && isSub && (
          <div className="mt-4">
            <ChastityCatalogAndRequest
              arrangementId={arrangement.id}
              domId={arrangement.dom_id}
              boundDollars={arrangement.bound_dollars}
            />
          </div>
        )}
        {arrangement.status === "active" && (
          <ChastityUnlockLog arrangementId={arrangement.id} />
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-card p-6 shadow-sm">
        <KeuschhaltungDetailTabs partnerId={isDom ? arrangement.sub_id : arrangement.dom_id}>
      {/* Aufgabenliste */}
      <div className="mt-4 rounded-xl border border-gray-700 bg-background p-4">
        <h2 className="text-lg font-semibold text-white">Aufgaben</h2>
        {!tasks?.length ? (
          <p className="mt-4 text-gray-500">Noch keine Aufgaben.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => {
              const isOverdue = task.status === "pending" && task.due_date < today;
              return (
                <li
                  key={task.id}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 ${
                    isOverdue
                      ? "border-red-500/50 bg-red-950/20"
                      : "border-gray-700 bg-background"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">
                      {task.title}
                      {isOverdue && (
                        <span className="ml-2 rounded bg-red-600/50 px-2 py-0.5 text-xs font-medium text-red-200">
                          Überfällig
                        </span>
                      )}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-400">{task.description}</p>
                    )}
                    {task.requires_photo && (
                      <p className="text-xs text-amber-400">Foto-Beweis erforderlich</p>
                    )}
                    {task.proof_photo_url && task.status === "awaiting_confirmation" && (
                      <div className="mt-2">
                        <img
                          src={supabase.storage.from("task-proofs").getPublicUrl(task.proof_photo_url).data.publicUrl}
                          alt="Beweisfoto"
                          className="max-h-48 rounded-lg border border-gray-700 object-cover"
                        />
                      </div>
                    )}
                    {task.dom_comment && task.status === "completed" && (
                      <p className="mt-1 text-sm text-green-400/90">💬 {task.dom_comment}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Frist: {task.due_date}
                      {task.recurrence === "daily" && " · Täglich"}
                      {" · "}{task.bound_dollars_on_completion} BD · {STATUS_LABELS[task.status] ?? task.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSub && task.status === "pending" && task.due_date <= today && (
                      <ChastityCompleteTaskWithPhoto
                        taskId={task.id}
                        arrangementId={arrangement.id}
                        requiresPhoto={task.requires_photo ?? false}
                      />
                    )}
                    {isDom && task.status === "pending" && (
                      <ChastityPenaltyButton taskId={task.id} />
                    )}
                    {isDom && task.status === "awaiting_confirmation" && (
                      <>
                        {task.due_date <= today && (
                          <ChastityConfirmTaskButton taskId={task.id} />
                        )}
                        <ChastityPenaltyButton taskId={task.id} label="Ablehnen / Strafpunkte" />
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
        </KeuschhaltungDetailTabs>
      </div>
    </Container>
  );
}
