-- Foto-Beweis für Aufgaben

-- 1. chastity_tasks erweitern
alter table public.chastity_tasks
  add column if not exists requires_photo boolean default false;
alter table public.chastity_tasks
  add column if not exists proof_photo_url text;

-- 2. Storage Bucket task-proofs
insert into storage.buckets (id, name, public)
values ('task-proofs', 'task-proofs', true)
on conflict (id) do nothing;

-- RLS: Pfad task-proofs/<arrangement_id>/<task_id>.<ext>
create policy "task_proofs_select" on storage.objects
  for select using (
    bucket_id = 'task-proofs' and auth.role() = 'authenticated' and
    exists (
      select 1 from public.chastity_arrangements a
      where a.id::text = split_part(name, '/', 1)
      and (a.dom_id = auth.uid() or a.sub_id = auth.uid())
    )
  );

create policy "task_proofs_insert" on storage.objects
  for insert with check (
    bucket_id = 'task-proofs' and auth.role() = 'authenticated' and
    exists (
      select 1 from public.chastity_arrangements a
      where a.id::text = split_part(name, '/', 1)
      and (a.dom_id = auth.uid() or a.sub_id = auth.uid())
    )
  );

-- complete_chastity_task: optional proof_photo_url
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
begin
  select a.sub_id into v_sub_id
  from public.chastity_tasks t
  join public.chastity_arrangements a on a.id = t.arrangement_id
  where t.id = p_task_id and t.status = 'pending';
  if not found or v_sub_id != auth.uid() then
    raise exception 'Task nicht gefunden oder du bist nicht der Sub';
  end if;
  update public.chastity_tasks
  set status = 'awaiting_confirmation', completed_at = now(),
      proof_photo_url = coalesce(p_proof_photo_url, proof_photo_url)
  where id = p_task_id;
end;
$$;
