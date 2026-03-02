-- Storage-Bucket für Nachrichten-Anhänge

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-attachments',
  'message-attachments',
  false,
  10 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Nur Teilnehmer der Konversation dürfen lesen/schreiben.

drop policy if exists "message_attachments_storage_select" on storage.objects;
create policy "message_attachments_storage_select" on storage.objects
  for select using (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

drop policy if exists "message_attachments_storage_insert" on storage.objects;
create policy "message_attachments_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

drop policy if exists "message_attachments_storage_delete" on storage.objects;
create policy "message_attachments_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'message-attachments'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

