-- Zustell- und Gelesen-Status für Nachrichten

alter table public.messages add column if not exists delivered_at timestamptz;
alter table public.messages add column if not exists read_at timestamptz;

comment on column public.messages.delivered_at is 'Zeitpunkt, zu dem der Empfänger die Nachricht empfangen hat';
comment on column public.messages.read_at is 'Zeitpunkt, zu dem der Empfänger die Nachricht gelesen hat';

-- RLS: Nur der Empfänger (anderer Gesprächsteilnehmer) darf delivered_at und read_at setzen
-- Empfänger = User in der Konversation, der NICHT der Sender der Nachricht ist
create policy "messages_update_recipient" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
        and sender_id != auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
