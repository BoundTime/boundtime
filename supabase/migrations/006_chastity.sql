-- Keuschhaltung: Vereinbarungen zwischen Dom und Sub, Aufgaben, Punkte, Belohnung

create table public.chastity_arrangements (
  id uuid primary key default gen_random_uuid(),
  dom_id uuid not null references public.profiles(id) on delete cascade,
  sub_id uuid not null references public.profiles(id) on delete cascade,
  reward_goal_points int not null check (reward_goal_points > 0),
  reward_description text,
  current_points int not null default 0 check (current_points >= 0),
  status text not null check (status in ('pending', 'active', 'paused', 'ended')) default 'pending',
  reward_claimed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.chastity_tasks (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  points_on_completion int not null check (points_on_completion >= 0),
  status text not null check (status in ('pending', 'completed', 'missed', 'cancelled')) default 'pending',
  completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create index chastity_arrangements_dom_id on public.chastity_arrangements(dom_id);
create index chastity_arrangements_sub_id on public.chastity_arrangements(sub_id);
create index chastity_tasks_arrangement_id on public.chastity_tasks(arrangement_id);

alter table public.chastity_arrangements enable row level security;
alter table public.chastity_tasks enable row level security;

-- Arrangements: Lesen/Update für Dom oder Sub; Insert nur als Dom
create policy "chastity_arrangements_select" on public.chastity_arrangements
  for select using (auth.uid() = dom_id or auth.uid() = sub_id);
create policy "chastity_arrangements_insert" on public.chastity_arrangements
  for insert with check (auth.uid() = dom_id);
create policy "chastity_arrangements_update" on public.chastity_arrangements
  for update using (auth.uid() = dom_id or auth.uid() = sub_id);

-- Tasks: Lesen wenn User Dom oder Sub des Arrangements
create policy "chastity_tasks_select" on public.chastity_tasks
  for select using (
    exists (
      select 1 from public.chastity_arrangements a
      where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid())
    )
  );
create policy "chastity_tasks_insert" on public.chastity_tasks
  for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_tasks_update" on public.chastity_tasks
  for update using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_tasks_delete" on public.chastity_tasks
  for delete using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );

-- Sub markiert Aufgabe als erledigt → Punkte werden addiert (nur über Funktion, nicht direkt)
create or replace function public.complete_chastity_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_arrangement_id uuid;
  v_sub_id uuid;
  v_points int;
begin
  select t.arrangement_id, a.sub_id, t.points_on_completion
  into v_arrangement_id, v_sub_id, v_points
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'pending';
  if not found or v_sub_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Sub';
  end if;
  update public.chastity_tasks set status = 'completed', completed_at = now() where id = p_task_id;
  update public.chastity_arrangements set current_points = current_points + v_points, updated_at = now() where id = v_arrangement_id;
end;
$$;

grant execute on function public.complete_chastity_task(uuid) to authenticated;

-- Sub holt Belohnung ab (Punkte zurücksetzen)
create or replace function public.claim_chastity_reward(p_arrangement_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id uuid;
  v_current int;
  v_goal int;
begin
  select sub_id, current_points, reward_goal_points into v_sub_id, v_current, v_goal
  from public.chastity_arrangements where id = p_arrangement_id;
  if not found or v_sub_id != auth.uid() then
    raise exception 'Vereinbarung nicht gefunden oder du bist nicht der Sub';
  end if;
  if v_current < v_goal then
    raise exception 'Belohnungsziel noch nicht erreicht';
  end if;
  update public.chastity_arrangements
  set current_points = 0, reward_claimed_at = now(), updated_at = now()
  where id = p_arrangement_id;
end;
$$;

grant execute on function public.claim_chastity_reward(uuid) to authenticated;
