-- Streaks & Badges: Logik implementieren

-- 1. last_streak_date für Streak-Berechnung
alter table public.chastity_arrangements
  add column if not exists last_streak_date date;

-- 2. Hilfsfunktion: Badge vergeben (chastity_badges_earned hat nur SELECT-RLS)
create or replace function public.award_chastity_badge(
  p_arrangement_id uuid,
  p_badge_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.chastity_badges_earned (arrangement_id, badge_id)
  values (p_arrangement_id, p_badge_id)
  on conflict (arrangement_id, badge_id) do nothing;
end;
$$;

-- 3. confirm_chastity_task: Streak + Badges ergänzen
create or replace function public.confirm_chastity_task(
  p_task_id uuid,
  p_dom_comment text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
  v_next_due date;
  v_task_date date;
  v_cur_streak int;
  v_long_streak int;
  v_last_date date;
  v_new_bound int;
begin
  select t.arrangement_id, t.bound_dollars_on_completion, t.recurrence, t.due_date, a.dom_id,
         a.last_streak_date, a.current_streak_days, a.longest_streak_days, a.bound_dollars, a.locked_at
  into v_rec
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'awaiting_confirmation';
  if not found or v_rec.dom_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht die Dom';
  end if;

  v_task_date := coalesce(v_rec.due_date::date, current_date);
  v_cur_streak := coalesce(v_rec.current_streak_days, 0);
  v_long_streak := coalesce(v_rec.longest_streak_days, 0);
  v_last_date := v_rec.last_streak_date;

  -- Streak-Logik
  if v_task_date = v_last_date then
    null;  /* gleicher Tag, keine Änderung */
  elsif v_task_date = v_last_date + 1 then
    v_cur_streak := v_cur_streak + 1;
    v_last_date := v_task_date;
  elsif v_last_date is null or v_task_date > v_last_date + 1 then
    v_cur_streak := 1;
    v_last_date := v_task_date;
  end if;
  /* v_task_date < v_last_date: Nachreichung alter Aufgabe → keine Änderung */
  v_long_streak := greatest(v_long_streak, v_cur_streak);

  v_new_bound := coalesce(v_rec.bound_dollars, 0) + coalesce(v_rec.bound_dollars_on_completion, 0);

  update public.chastity_tasks
  set status = 'completed', dom_comment = coalesce(p_dom_comment, dom_comment)
  where id = p_task_id;

  update public.chastity_arrangements
  set bound_dollars = v_new_bound,
      current_streak_days = v_cur_streak,
      longest_streak_days = v_long_streak,
      last_streak_date = v_last_date,
      updated_at = now()
  where id = v_rec.arrangement_id;

  if v_rec.recurrence = 'daily' then
    v_next_due := coalesce(v_rec.due_date, current_date) + interval '1 day';
    insert into public.chastity_tasks (arrangement_id, title, description, due_date, bound_dollars_on_completion, penalty_bound_dollars, status, recurrence, created_by)
    select arrangement_id, title, description, v_next_due::date, bound_dollars_on_completion, penalty_bound_dollars, 'pending', 'daily', created_by
    from public.chastity_tasks where id = p_task_id;
  end if;

  -- Badges vergeben
  if v_long_streak >= 7 then
    perform public.award_chastity_badge(v_rec.arrangement_id, 'first_week');
  end if;
  if v_cur_streak >= 7 then
    perform public.award_chastity_badge(v_rec.arrangement_id, 'streak_7');
  end if;
  if v_new_bound >= 100 then
    perform public.award_chastity_badge(v_rec.arrangement_id, '100_bd');
  end if;
  if v_rec.locked_at is not null and (current_date - v_rec.locked_at::date) >= 30 then
    perform public.award_chastity_badge(v_rec.arrangement_id, '30_days_locked');
  end if;
end;
$$;

-- 4. apply_chastity_penalty: Streak zurücksetzen
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
      current_streak_days = 0,
      last_streak_date = null,
      updated_at = now()
  where id = v_arrangement_id;
end;
$$;

-- 5. approve_reward_request: Badge first_reward
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
         c.price_bound_dollars, c.requires_unlock, c.dom_id as catalog_dom_id,
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
  if exists (select 1 from public.chastity_arrangements a where a.id = v_rec.arrangement_id and a.dom_id != v_rec.catalog_dom_id) then
    raise exception 'Katalog-Item gehört nicht zu dieser Vereinbarung';
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
  perform public.award_chastity_badge(v_rec.arrangement_id, 'first_reward');
end;
$$;
