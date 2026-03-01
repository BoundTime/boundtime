-- Dom-Bestätigung nur wenn Fristdatum erreicht (besonders wichtig für tägliche Aufgaben)
-- Der Dom kann eine Aufgabe erst bestätigen, wenn due_date erreicht ist.

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
  if (v_rec.due_date)::date > current_date then
    raise exception 'Aufgabe kann erst am Fristdatum bestätigt werden. Frist: %', v_rec.due_date;
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
