-- Nachrichten-Insert blockieren, wenn Zugriffsbeschränkung aktiv ist (Paar-Account)
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
    and not public.is_restriction_blocking_write(auth.uid())
  );
