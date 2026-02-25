-- Privatnachrichten (1:1 Chat)

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id) on delete cascade,
  participant_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  check (participant_a < participant_b),
  unique (participant_a, participant_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  created_at timestamptz default now()
);

create index conversations_participant_a on public.conversations(participant_a);
create index conversations_participant_b on public.conversations(participant_b);
create index messages_conversation_id on public.messages(conversation_id);
create index messages_created_at on public.messages(created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- conversations: lesen/schreiben nur als Beteiligter
create policy "conversations_select" on public.conversations
  for select using (auth.uid() = participant_a or auth.uid() = participant_b);
create policy "conversations_insert" on public.conversations
  for insert with check (
    auth.uid() = participant_a or auth.uid() = participant_b
  );

-- messages: lesen nur wenn User in conversation, insert nur als sender und Beteiligter
create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );
