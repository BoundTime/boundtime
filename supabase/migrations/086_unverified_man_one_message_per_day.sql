-- Nicht verifizierter Mann: max. eine Nachricht pro Kalendertag (UTC)

create or replace function public.can_unverified_man_send_today(p_sender_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gender text;
  v_verified boolean;
  v_count bigint;
  v_today_utc timestamptz;
begin
  select gender, verified into v_gender, v_verified
  from profiles where id = p_sender_id;
  if v_gender is null or v_verified is null then
    return false;
  end if;
  if v_gender != 'Mann' or v_verified = true then
    return true;
  end if;
  v_today_utc := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
  select count(*) into v_count
  from messages
  where sender_id = p_sender_id
    and created_at >= v_today_utc
    and created_at < v_today_utc + interval '1 day';
  return coalesce(v_count, 0) < 1;
end;
$$;

comment on function public.can_unverified_man_send_today(uuid) is
  'Erlaubt true, wenn Sender kein Mann ist, verifiziert ist, oder heute (UTC) noch keine Nachricht gesendet hat. Nicht verifizierte Männer: max. 1 Nachricht/Tag.';

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
    and public.can_unverified_man_send_today(auth.uid())
  );
