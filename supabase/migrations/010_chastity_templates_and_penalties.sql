-- Vorgegebene Aufgaben und Belohnungen, Strafpunkte

-- 1. Aufgabenvorlagen
create table if not exists public.chastity_task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  default_points int not null default 10,
  default_penalty_points int,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.chastity_task_templates enable row level security;
create policy "chastity_task_templates_select" on public.chastity_task_templates
  for select using (true);

-- 2. Belohnungsvorlagen
create table if not exists public.chastity_reward_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.chastity_reward_templates enable row level security;
create policy "chastity_reward_templates_select" on public.chastity_reward_templates
  for select using (true);

-- 3. chastity_tasks erweitern: penalty_points, Status failed/overdue
alter table public.chastity_tasks
  add column if not exists penalty_points int;

alter table public.chastity_tasks
  drop constraint if exists chastity_tasks_status_check;
alter table public.chastity_tasks
  add constraint chastity_tasks_status_check
  check (status in ('pending', 'completed', 'missed', 'cancelled', 'failed', 'overdue'));

-- 4. Seed: Aufgabenvorlagen
insert into public.chastity_task_templates (title, description, default_points, default_penalty_points, sort_order)
values
  ('Tägliche Berichterstattung', 'Täglicher Status- oder Stimmungsbericht', 10, 10, 1),
  ('Fotos senden', 'Bilder als Nachweis', 15, 15, 2),
  ('Tägliche Übungen', 'z.B. Kegel, Fitness', 10, 10, 3),
  ('Keuschheitsbericht', 'Kurzer Bericht zur Keuschheit', 5, 5, 4),
  ('Kreative Aufgabe', 'Individuell festzulegen', 20, 20, 5),
  ('Finanzielle Zuwendung', 'Spende oder Zuwendung', 0, 0, 6)
;

-- 5. Seed: Belohnungsvorlagen
insert into public.chastity_reward_templates (title, description, sort_order)
values
  ('Eine Woche frei / Selbstbefriedigung erlaubt', null, 1),
  ('Kurzes Treffen', null, 2),
  ('Erlaubnis für … (Freitext ergänzen)', null, 3),
  ('Zwei Tage Pause', null, 4),
  ('Belohnung nach Absprache', null, 5)
;

-- 6. Strafpunkte-Funktion
create or replace function public.apply_chastity_penalty(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_arrangement_id uuid;
  v_dom_id uuid;
  v_penalty int;
begin
  select t.arrangement_id, a.dom_id,
    coalesce(t.penalty_points, t.points_on_completion)
  into v_arrangement_id, v_dom_id, v_penalty
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'pending';
  if not found or v_dom_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Dom';
  end if;
  update public.chastity_tasks
  set status = 'failed', completed_at = null
  where id = p_task_id;
  update public.chastity_arrangements
  set current_points = greatest(0, current_points - coalesce(v_penalty, 0)),
      updated_at = now()
  where id = v_arrangement_id;
end;
$$;

grant execute on function public.apply_chastity_penalty(uuid) to authenticated;
