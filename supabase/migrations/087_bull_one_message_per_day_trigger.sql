-- Bull / nicht verifizierter Mann: Trigger erlaubt 1 Nachricht pro Tag (UTC), blockiert erst ab der zweiten

create or replace function public.messages_check_bull_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_verified boolean;
  v_today_utc timestamptz;
  v_count bigint;
begin
  select p.role, p.verified
  into v_role, v_verified
  from public.profiles p
  where p.id = new.sender_id;

  if v_role is null then
    return new;
  end if;

  if v_role = 'Bull' and (v_verified is null or v_verified = false) then
    v_today_utc := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
    select count(*) into v_count
    from public.messages
    where sender_id = new.sender_id
      and created_at >= v_today_utc
      and created_at < v_today_utc + interval '1 day';
    if coalesce(v_count, 0) >= 1 then
      raise exception 'Als Bull musst du verifiziert sein, um Nachrichten zu senden. Du hast heute bereits eine Nachricht verschickt. Verifiziere dich für unbegrenzte Nachrichten.';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.messages_check_bull_verified() is
  'Nicht verifizierte Bulls dürfen max. 1 Nachricht pro Tag (UTC) senden; ab der zweiten wird geworfen. Verifizierte Bulls unbegrenzt.';
