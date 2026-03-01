-- User darf eigenes Pending- und Rejected-Update (Ersatzfoto / erneutes Einreichen)
-- Nach Ablehnung soll der Nutzer erneut einreichen können (upsert)

drop policy if exists "verifications_update_own_pending" on public.verifications;
create policy "verifications_update_own_pending_rejected" on public.verifications
  for update using (
    user_id = auth.uid() and status in ('pending', 'rejected')
  )
  with check (user_id = auth.uid());
