-- Nachrichten: Anhänge + Bearbeiten

-- 1) messages.edited_at
alter table public.messages
  add column if not exists edited_at timestamptz;

comment on column public.messages.edited_at is 'Zeitpunkt, zu dem der Absender die Nachricht bearbeitet hat';

-- Sender darf eigene Nachrichten bearbeiten
drop policy if exists "messages_update_sender" on public.messages;
create policy "messages_update_sender" on public.messages
  for update using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

-- 2) message_attachments Tabelle
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_path text not null,
  filename text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

alter table public.message_attachments enable row level security;

-- Nur Beteiligte der Konversation dürfen Anhänge sehen
drop policy if exists "message_attachments_select" on public.message_attachments;
create policy "message_attachments_select" on public.message_attachments
  for select using (
    exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

-- Nur der Absender darf Anhänge zu seinen Nachrichten anlegen
drop policy if exists "message_attachments_insert" on public.message_attachments;
create policy "message_attachments_insert" on public.message_attachments
  for insert with check (
    exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and m.sender_id = auth.uid()
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

