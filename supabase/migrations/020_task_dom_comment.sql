-- Dom-Kommentar bei bestätigten Aufgaben

alter table public.chastity_tasks add column if not exists dom_comment text;

create or replace function public.confirm_chastity_task(
  p_task_id uuid,
  p_dom_comment text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare v_rec record; v_next_due date;
begin
  select t.arrangement_id, t.bound_dollars_on_completion, t.recurrence, t.due_date, a.dom_id
  into v_rec from public.chastity_tasks t join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'awaiting_confirmation';
  if not found or v_rec.dom_id != auth.uid() then raise exception 'Task nicht gefunden oder du bist nicht die Dom'; end if;
  update public.chastity_tasks set status = 'completed', dom_comment = coalesce(p_dom_comment, dom_comment) where id = p_task_id;
  update public.chastity_arrangements set bound_dollars = bound_dollars + v_rec.bound_dollars_on_completion, updated_at = now() where id = v_rec.arrangement_id;
  if v_rec.recurrence = 'daily' then
    v_next_due := coalesce(v_rec.due_date, current_date) + interval '1 day';
    insert into public.chastity_tasks (arrangement_id, title, description, due_date, bound_dollars_on_completion, penalty_bound_dollars, status, recurrence, created_by)
    select arrangement_id, title, description, v_next_due::date, bound_dollars_on_completion, penalty_bound_dollars, 'pending', 'daily', created_by
    from public.chastity_tasks where id = p_task_id;
  end if;
end; $$;
