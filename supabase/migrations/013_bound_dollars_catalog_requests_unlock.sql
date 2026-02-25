-- BoundDollars, Belohnungskatalog, Anfragen, Unlock-Log

-- 1. chastity_arrangements: Punkte → BoundDollars
alter table public.chastity_arrangements
  rename column current_points to bound_dollars;
alter table public.chastity_arrangements
  rename column reward_goal_points to reward_goal_bound_dollars;
alter table public.chastity_arrangements
  drop constraint if exists chastity_arrangements_reward_goal_points_check;
alter table public.chastity_arrangements
  add constraint chastity_arrangements_reward_goal_bound_dollars_check
  check (reward_goal_bound_dollars >= 0);

-- 2. chastity_tasks: Punkte → BoundDollars
alter table public.chastity_tasks
  rename column points_on_completion to bound_dollars_on_completion;
alter table public.chastity_tasks
  rename column penalty_points to penalty_bound_dollars;

-- 3. chastity_task_templates: Punkte → BoundDollars
alter table public.chastity_task_templates
  rename column default_points to default_bound_dollars;
alter table public.chastity_task_templates
  rename column default_penalty_points to default_penalty_bound_dollars;

-- 4. chastity_reward_templates: Neue Vorlagen (alte löschen, neue einfügen)
truncate table public.chastity_reward_templates restart identity;
alter table public.chastity_reward_templates
  add column if not exists requires_unlock boolean default false;

insert into public.chastity_reward_templates (title, description, sort_order, requires_unlock)
values
  ('Orgasmus-Erlaubnis', 'Sub darf orgasmieren – Unlock-Zeit erforderlich', 1, true),
  ('Edging-Erlaubnis', 'Sub darf edgen – Unlock-Zeit erforderlich', 2, true),
  ('Kurzzeit-Unlock', 'Sub darf KG kurzzeitig ablegen – Unlock-Zeit erforderlich', 3, true),
  ('Treffen mit der Dom', 'Persönliches Treffen', 4, false),
  ('Video-Call', 'Videoanruf mit der Dom', 5, false),
  ('Foto der Dom', 'Persönliches Foto der Dom', 6, false),
  ('Sprachnachricht', 'Persönliche Sprachnachricht der Dom', 7, false),
  ('Bettzeit verschieben', 'Eine Nacht länger aufbleiben', 8, false),
  ('Film/Serie schauen', 'Erlaubnis, einen Film/eine Serie zu schauen', 9, false);

-- 5. chastity_catalog_items
create table if not exists public.chastity_catalog_items (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  reward_template_id uuid references public.chastity_reward_templates(id) on delete set null,
  custom_title text,
  price_bound_dollars int not null check (price_bound_dollars >= 0),
  requires_unlock boolean default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.chastity_catalog_items enable row level security;
create policy "chastity_catalog_items_select" on public.chastity_catalog_items
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_catalog_items_insert" on public.chastity_catalog_items
  for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_catalog_items_update" on public.chastity_catalog_items
  for update using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_catalog_items_delete" on public.chastity_catalog_items
  for delete using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );

create index chastity_catalog_items_arrangement_id on public.chastity_catalog_items(arrangement_id);

-- 6. chastity_reward_requests
create table if not exists public.chastity_reward_requests (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  catalog_item_id uuid references public.chastity_catalog_items(id) on delete set null,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'declined')) default 'pending',
  dom_comment text,
  approved_at timestamptz,
  created_at timestamptz default now()
);

alter table public.chastity_reward_requests enable row level security;
create policy "chastity_reward_requests_select" on public.chastity_reward_requests
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_reward_requests_insert" on public.chastity_reward_requests
  for insert with check (
    auth.uid() = requested_by and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.sub_id = auth.uid())
  );
create policy "chastity_reward_requests_update" on public.chastity_reward_requests
  for update using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );

create index chastity_reward_requests_arrangement_id on public.chastity_reward_requests(arrangement_id);

-- 7. chastity_unlock_log
create table if not exists public.chastity_unlock_log (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  reward_request_id uuid references public.chastity_reward_requests(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz,
  duration_minutes int,
  reward_title text,
  created_at timestamptz default now()
);

alter table public.chastity_unlock_log enable row level security;
create policy "chastity_unlock_log_select" on public.chastity_unlock_log
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_unlock_log_insert" on public.chastity_unlock_log
  for insert with check (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );

create index chastity_unlock_log_arrangement_id on public.chastity_unlock_log(arrangement_id);

-- 8. approve_reward_request
create or replace function public.approve_reward_request(
  p_request_id uuid,
  p_comment text default null,
  p_unlock_start timestamptz default null,
  p_unlock_end timestamptz default null,
  p_unlock_duration_minutes int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
begin
  select r.arrangement_id, r.catalog_item_id, r.requested_by,
         c.price_bound_dollars, c.requires_unlock,
         coalesce(c.custom_title, t.title) as reward_title
  into v_rec
  from public.chastity_reward_requests r
  left join public.chastity_catalog_items c on c.id = r.catalog_item_id
  left join public.chastity_reward_templates t on t.id = c.reward_template_id
  where r.id = p_request_id and r.status = 'pending';
  if not found then
    raise exception 'Anfrage nicht gefunden oder nicht mehr ausstehend';
  end if;
  if not exists (select 1 from public.chastity_arrangements a where a.id = v_rec.arrangement_id and a.dom_id = auth.uid()) then
    raise exception 'Du bist nicht die Dom dieser Vereinbarung';
  end if;
  if (select bound_dollars from public.chastity_arrangements where id = v_rec.arrangement_id) < coalesce(v_rec.price_bound_dollars, 0) then
    raise exception 'Sub hat nicht genug BoundDollars';
  end if;
  update public.chastity_arrangements
  set bound_dollars = greatest(0, bound_dollars - coalesce(v_rec.price_bound_dollars, 0)),
      updated_at = now()
  where id = v_rec.arrangement_id;
  update public.chastity_reward_requests
  set status = 'approved', dom_comment = p_comment, approved_at = now()
  where id = p_request_id;
  if v_rec.requires_unlock then
    insert into public.chastity_unlock_log (arrangement_id, reward_request_id, start_at, end_at, duration_minutes, reward_title)
    values (
      v_rec.arrangement_id,
      p_request_id,
      coalesce(p_unlock_start, now()),
      p_unlock_end,
      p_unlock_duration_minutes,
      v_rec.reward_title
    );
  end if;
end;
$$;

grant execute on function public.approve_reward_request(uuid, text, timestamptz, timestamptz, int) to authenticated;

-- 9. decline_reward_request
create or replace function public.decline_reward_request(p_request_id uuid, p_comment text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.chastity_reward_requests r
    join public.chastity_arrangements a on a.id = r.arrangement_id
    where r.id = p_request_id and r.status = 'pending' and a.dom_id = auth.uid()
  ) then
    raise exception 'Anfrage nicht gefunden oder du bist nicht die Dom';
  end if;
  update public.chastity_reward_requests
  set status = 'declined', dom_comment = p_comment
  where id = p_request_id;
end;
$$;

grant execute on function public.decline_reward_request(uuid, text) to authenticated;

-- 10. Funktionen: bound_dollars statt current_points
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
    coalesce(t.penalty_bound_dollars, t.bound_dollars_on_completion)
  into v_arrangement_id, v_dom_id, v_penalty
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status in ('pending', 'awaiting_confirmation');
  if not found or v_dom_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Dom';
  end if;
  update public.chastity_tasks
  set status = 'failed', completed_at = null
  where id = p_task_id;
  update public.chastity_arrangements
  set bound_dollars = greatest(0, bound_dollars - coalesce(v_penalty, 0)),
      updated_at = now()
  where id = v_arrangement_id;
end;
$$;

create or replace function public.confirm_chastity_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
  v_next_due date;
begin
  select t.arrangement_id, t.bound_dollars_on_completion, t.recurrence, t.due_date,
         a.dom_id
  into v_rec
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'awaiting_confirmation';
  if not found or v_rec.dom_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Dom';
  end if;
  update public.chastity_tasks set status = 'completed' where id = p_task_id;
  update public.chastity_arrangements
  set bound_dollars = bound_dollars + v_rec.bound_dollars_on_completion, updated_at = now()
  where id = v_rec.arrangement_id;
  if v_rec.recurrence = 'daily' then
    v_next_due := coalesce(v_rec.due_date, current_date) + interval '1 day';
    insert into public.chastity_tasks (
      arrangement_id, title, description, due_date, bound_dollars_on_completion, penalty_bound_dollars,
      status, recurrence, created_by
    )
    select arrangement_id, title, description, v_next_due::date, bound_dollars_on_completion, penalty_bound_dollars,
           'pending', 'daily', created_by
    from public.chastity_tasks where id = p_task_id;
  end if;
end;
$$;

-- claim_chastity_reward: BoundDollars-Varianten; Behält alte Logik (Ziel erreicht → BD zurücksetzen)
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
  select sub_id, bound_dollars, reward_goal_bound_dollars into v_sub_id, v_current, v_goal
  from public.chastity_arrangements where id = p_arrangement_id;
  if not found or v_sub_id != auth.uid() then
    raise exception 'Vereinbarung nicht gefunden oder du bist nicht der Sub';
  end if;
  if v_current < v_goal then
    raise exception 'Belohnungsziel noch nicht erreicht';
  end if;
  update public.chastity_arrangements
  set bound_dollars = 0, reward_claimed_at = now(), updated_at = now()
  where id = p_arrangement_id;
end;
$$;
