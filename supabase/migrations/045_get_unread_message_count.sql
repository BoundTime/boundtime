-- RPC: Anzahl ungelesener Nachrichten für den eingeloggten Nutzer
-- Ungelesen = Empfänger (sender_id != auth.uid()) und read_at IS NULL

create or replace function public.get_unread_message_count()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select count(*)::bigint
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    and m.sender_id != auth.uid()
    and m.read_at is null;
$$;

grant execute on function public.get_unread_message_count() to authenticated;
