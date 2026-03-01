-- Keuschlings-Aufgaben: Kein "Als erledigt markieren" vor Frist
-- Der Sub kann eine Aufgabe erst als abgearbeitet melden, wenn due_date erreicht ist.
-- Dadurch kann der Dom erst bestätigen, nachdem der Keuschling sie erledigt hat.

create or replace function public.complete_chastity_task(
  p_task_id uuid,
  p_proof_photo_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id uuid;
  v_due_date date;
begin
  select a.sub_id, t.due_date into v_sub_id, v_due_date
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'pending';
  if not found or v_sub_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Sub';
  end if;
  if v_due_date > current_date then
    raise exception 'Aufgabe kann erst ab dem Fristdatum als erledigt gemeldet werden. Frist: %', v_due_date;
  end if;
  update public.chastity_tasks
  set status = 'awaiting_confirmation', completed_at = now(),
      proof_photo_url = coalesce(p_proof_photo_url, proof_photo_url)
  where id = p_task_id;
end;
$$;
