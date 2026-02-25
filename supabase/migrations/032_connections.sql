-- Dom-Sub-Verbindungen (Connections): Sub maximal eine aktive Verbindung, BD-Übertragung beim Trennen

-- 1. profiles.bound_dollars (persistenter BD-Kontostand ohne aktive Verbindung)
alter table public.profiles
  add column if not exists bound_dollars integer not null default 0;

-- 2. Tabelle connections
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  sub_id uuid not null references public.profiles(id) on delete cascade,
  dom_id uuid not null references public.profiles(id) on delete cascade,
  relationship_type_sub text,
  relationship_type_dom text,
  status text not null check (status in ('active', 'ended')) default 'active',
  created_at timestamptz default now(),
  ended_at timestamptz
);

create unique index connections_sub_active_unique on public.connections (sub_id) where status = 'active';
create index connections_dom_id on public.connections(dom_id);
create index connections_sub_id on public.connections(sub_id);

alter table public.connections enable row level security;

-- RLS: Nur Sub und Dom können ihre Verbindungen lesen
create policy "connections_select_participants" on public.connections
  for select using (auth.uid() = sub_id or auth.uid() = dom_id);

-- 3. are_mutual_friends: gegenseitiges Folgen
create or replace function public.are_mutual_friends(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.follows f1
    join public.follows f2 on f2.follower_id = p_user_b and f2.following_id = p_user_a
    where f1.follower_id = p_user_a and f1.following_id = p_user_b
  );
$$;

grant execute on function public.are_mutual_friends(uuid, uuid) to authenticated;

-- 4. get_sub_connection_display: Für Profil-Anzeige – ob Sub vergeben ist und ggf. Dom-Nick
create or replace function public.get_sub_connection_display(p_sub_id uuid)
returns table(has_connection boolean, dom_nick text)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_dom_id uuid;
  v_dom_nick text;
  v_viewer uuid := auth.uid();
  v_can_see_dom boolean := false;
begin
  if v_viewer is null then
    return query select false, null::text;
    return;
  end if;
  select c.dom_id into v_dom_id
  from public.connections c
  where c.sub_id = p_sub_id and c.status = 'active'
  limit 1;
  if v_dom_id is null then
    return query select false, null::text;
    return;
  end if;
  if v_viewer = p_sub_id or v_viewer = v_dom_id then
    v_can_see_dom := true;
  elsif public.are_mutual_friends(v_viewer, p_sub_id) then
    v_can_see_dom := true;
  end if;
  if v_can_see_dom then
    select nick into v_dom_nick from public.profiles where id = v_dom_id;
  end if;
  return query select true, v_dom_nick;
end;
$$;

grant execute on function public.get_sub_connection_display(uuid) to authenticated;

-- 5. end_connection: Verbindung + Arrangement beenden, BD an Sub übertragen
create or replace function public.end_connection(p_connection_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
  v_arr record;
begin
  select sub_id, dom_id, status into v_rec
  from public.connections
  where id = p_connection_id;
  if not found then
    raise exception 'Verbindung nicht gefunden';
  end if;
  if v_rec.status != 'active' then
    raise exception 'Verbindung ist bereits beendet';
  end if;
  if auth.uid() != v_rec.sub_id and auth.uid() != v_rec.dom_id then
    raise exception 'Du bist nicht Sub oder Dom dieser Verbindung';
  end if;
  -- Aktives Arrangement suchen
  select id, bound_dollars into v_arr
  from public.chastity_arrangements
  where dom_id = v_rec.dom_id and sub_id = v_rec.sub_id and status in ('active', 'paused')
  limit 1;
  if found and v_arr.bound_dollars > 0 then
    update public.profiles
    set bound_dollars = coalesce(bound_dollars, 0) + v_arr.bound_dollars
    where id = v_rec.sub_id;
  end if;
  if found then
    update public.chastity_arrangements
    set status = 'ended', updated_at = now()
    where id = v_arr.id;
  end if;
  update public.connections
  set status = 'ended', ended_at = now()
  where id = p_connection_id;
end;
$$;

grant execute on function public.end_connection(uuid) to authenticated;

-- 6. Trigger: Bei Arrangement-Wechsel zu active → Connection anlegen
create or replace function public.chastity_create_connection_on_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    insert into public.connections (sub_id, dom_id, status)
    values (new.sub_id, new.dom_id, 'active')
    on conflict (sub_id) where (status = 'active') do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists chastity_arrangements_create_connection on public.chastity_arrangements;
create trigger chastity_arrangements_create_connection
  after update on public.chastity_arrangements
  for each row
  execute function public.chastity_create_connection_on_active();

-- Blockieren: Sub darf nicht zweites Arrangement aktivieren, wenn bereits Verbindung existiert
create or replace function public.chastity_block_second_active_connection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    if exists (
      select 1 from public.connections c
      where c.sub_id = new.sub_id and c.status = 'active' and c.dom_id != new.dom_id
    ) then
      raise exception 'Dieser Sub hat bereits eine aktive Verbindung mit einer anderen Dom.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists chastity_arrangements_block_second_connection on public.chastity_arrangements;
create trigger chastity_arrangements_block_second_connection
  before update on public.chastity_arrangements
  for each row
  execute function public.chastity_block_second_active_connection();

-- 7. Backfill: Bestehende aktive Arrangements → Connections
insert into public.connections (sub_id, dom_id, status)
select ca.sub_id, ca.dom_id, 'active'
from (
  select distinct on (sub_id) sub_id, dom_id
  from public.chastity_arrangements
  where status in ('active', 'paused')
  order by sub_id, updated_at desc nulls last
) ca
where not exists (
  select 1 from public.connections c
  where c.sub_id = ca.sub_id and c.status = 'active'
);
