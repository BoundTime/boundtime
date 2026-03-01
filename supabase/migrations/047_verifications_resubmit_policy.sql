-- User darf eigenes Pending- und Rejected-Update (Ersatzfoto / erneutes Einreichen)
-- Nach Ablehnung soll der Nutzer erneut einreichen können (upsert)

-- Storage: Update/Überschreiben erlauben (upsert: true beim erneuten Einreichen)
drop policy if exists "verifications_storage_update_own" on storage.objects;
create policy "verifications_storage_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "verifications_update_own_pending" on public.verifications;
drop policy if exists "verifications_update_own_pending_rejected" on public.verifications;
create policy "verifications_update_own_pending_rejected" on public.verifications
  for update using (
    user_id = auth.uid() and status in ('pending', 'rejected')
  )
  with check (user_id = auth.uid());

-- RPC: Verifizierung einreichen/erneut einreichen – umgeht RLS zuverlässig
create or replace function public.submit_verification(p_photo_path text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_status text;
begin
  if v_user_id is null then
    raise exception 'Nicht authentifiziert';
  end if;
  select status into v_existing_status from public.verifications where user_id = v_user_id;
  if v_existing_status = 'approved' then
    raise exception 'Verifizierung bereits freigegeben';
  end if;
  insert into public.verifications (user_id, photo_path, status, submitted_at, note, reviewed_at, reviewed_by)
  values (v_user_id, p_photo_path, 'pending', now(), null, null, null)
  on conflict (user_id) do update set
    photo_path = excluded.photo_path,
    status = 'pending',
    submitted_at = excluded.submitted_at,
    note = null,
    reviewed_at = null,
    reviewed_by = null;
end;
$$;
