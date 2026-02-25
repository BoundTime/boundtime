-- Aufgaben: Wiederkehrend (täglich) + Dom-Bestätigung vor Punkten

-- 1. chastity_tasks: recurrence + Status awaiting_confirmation
alter table public.chastity_tasks
  add column if not exists recurrence text default 'once' check (recurrence in ('once', 'daily'));

alter table public.chastity_tasks
  drop constraint if exists chastity_tasks_status_check;
alter table public.chastity_tasks
  add constraint chastity_tasks_status_check
  check (status in ('pending', 'completed', 'missed', 'cancelled', 'failed', 'overdue', 'awaiting_confirmation'));

-- 2. Sub markiert als erledigt -> Status awaiting_confirmation (keine Punkte)
create or replace function public.complete_chastity_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id uuid;
begin
  select a.sub_id into v_sub_id
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'pending';
  if not found or v_sub_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Sub';
  end if;
  update public.chastity_tasks
  set status = 'awaiting_confirmation', completed_at = now()
  where id = p_task_id;
end;
$$;

-- 3. Dom bestätigt -> Punkte vergeben, ggf. Folge-Task bei daily
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
  select t.arrangement_id, t.points_on_completion, t.recurrence, t.due_date,
         a.dom_id, a.sub_id
  into v_rec
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'awaiting_confirmation';
  if not found or v_rec.dom_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Dom';
  end if;
  update public.chastity_tasks set status = 'completed' where id = p_task_id;
  update public.chastity_arrangements
  set current_points = current_points + v_rec.points_on_completion, updated_at = now()
  where id = v_rec.arrangement_id;
  if v_rec.recurrence = 'daily' then
    v_next_due := coalesce(v_rec.due_date, current_date) + interval '1 day';
    insert into public.chastity_tasks (
      arrangement_id, title, description, due_date, points_on_completion, penalty_points,
      status, recurrence, created_by
    )
    select arrangement_id, title, description, v_next_due::date, points_on_completion, penalty_points,
           'pending', 'daily', created_by
    from public.chastity_tasks where id = p_task_id;
  end if;
end;
$$;

grant execute on function public.confirm_chastity_task(uuid) to authenticated;

-- 4. apply_chastity_penalty: auch für awaiting_confirmation (Dom lehnt ab)
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
  where t.id = p_task_id and t.status in ('pending', 'awaiting_confirmation');
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
