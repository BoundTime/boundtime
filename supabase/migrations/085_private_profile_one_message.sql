-- Bei gesperrtem Profil (profile_private) ohne „Verbunden“ nur eine Nachricht erlauben

create or replace function public.can_insert_message_to_conv(p_conv_id uuid, p_sender_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with conv as (
    select id, participant_a, participant_b
    from conversations
    where id = p_conv_id
  ),
  other as (
    select case when c.participant_a = p_sender_id then c.participant_b else c.participant_a end as id
    from conv c
  ),
  rec_private as (
    select coalesce(p.profile_private, false) as profile_private
    from profiles p
    where p.id = (select id from other)
  ),
  connected as (
    select exists (
      select 1 from follows f1
      where f1.follower_id = p_sender_id and f1.following_id = (select id from other)
    ) and exists (
      select 1 from follows f2
      where f2.follower_id = (select id from other) and f2.following_id = p_sender_id
    ) as ok
  ),
  sent_count as (
    select count(*)::int as n
    from messages
    where conversation_id = p_conv_id and sender_id = p_sender_id
  )
  select
    not coalesce((select profile_private from rec_private), false)
    or coalesce((select ok from connected), false)
    or coalesce((select n from sent_count), 0) < 1
  from conv
  limit 1;
$$;

comment on function public.can_insert_message_to_conv(uuid, uuid) is
  'Erlaubt Insert: wenn Empfänger-Profil nicht gesperrt, oder verbunden (gegenseitiges Folgen), oder noch keine Nachricht vom Sender in dieser Konversation.';

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
    and not public.is_restriction_blocking_write(auth.uid())
    and public.can_insert_message_to_conv(conversation_id, auth.uid())
  );
