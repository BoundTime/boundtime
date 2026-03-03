-- 1. Rolle "Bull" ergänzen
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('Dom', 'Sub', 'Switcher', 'Bull'));

-- Bull darf Rolle nicht selbst ändern (nur Admin)
create or replace function public.profiles_prevent_bull_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'Bull' and (new.role is distinct from old.role) then
    if not exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
      raise exception 'Die Rolle Bull kann nur durch den Support geändert werden.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_profiles_prevent_bull_role_change on public.profiles;
create trigger tr_profiles_prevent_bull_role_change
  before update on public.profiles
  for each row execute function public.profiles_prevent_bull_role_change();

-- 2. Bewertungen: Paare bewerten Bulls
create table if not exists public.bull_ratings (
  id uuid primary key default gen_random_uuid(),
  bull_id uuid not null references public.profiles(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (bull_id, rater_id)
);

create index bull_ratings_bull_id on public.bull_ratings(bull_id);
create index bull_ratings_rater_id on public.bull_ratings(rater_id);

alter table public.bull_ratings enable row level security;

-- Nur bewerteter Bull sieht eigene Bewertungen; Paare (account_type='couple') sehen alle Bull-Bewertungen
create policy "bull_ratings_select_own_bull" on public.bull_ratings
  for select using (bull_id = auth.uid());

create policy "bull_ratings_select_couple" on public.bull_ratings
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.account_type = 'couple')
  );

-- Nur Paare dürfen bewerten; nur Bulls dürfen bewertet werden
create policy "bull_ratings_insert" on public.bull_ratings
  for insert with check (
    rater_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.account_type = 'couple')
    and exists (select 1 from public.profiles p where p.id = bull_id and p.role = 'Bull')
  );

-- 3. Beanstandungen
create table if not exists public.bull_rating_disputes (
  id uuid primary key default gen_random_uuid(),
  bull_rating_id uuid not null references public.bull_ratings(id) on delete cascade,
  bull_id uuid not null references public.profiles(id) on delete cascade,
  reason_text text not null check (char_length(reason_text) <= 2000),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'resolved_rejected', 'resolved_upheld'))
);

create index bull_rating_disputes_status on public.bull_rating_disputes(status);

alter table public.bull_rating_disputes enable row level security;

create policy "bull_rating_disputes_select_bull" on public.bull_rating_disputes
  for select using (bull_id = auth.uid());

create policy "bull_rating_disputes_select_admin" on public.bull_rating_disputes
  for select using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "bull_rating_disputes_insert" on public.bull_rating_disputes
  for insert with check (
    bull_id = auth.uid()
    and exists (select 1 from public.bull_ratings r where r.id = bull_rating_id and r.bull_id = auth.uid())
  );

create policy "bull_rating_disputes_update_admin" on public.bull_rating_disputes
  for update using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Benachrichtigung an alle Admins bei neuer Beanstandung
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message', 'new_follower', 'profile_view', 'post_like', 'profile_like',
  'photo_like', 'photo_comment', 'verification_rejected',
  'chastity_new_task', 'chastity_task_awaiting_confirmation', 'chastity_reward_request',
  'chastity_deadline_soon', 'chastity_arrangement_offer', 'chastity_sub_request', 'chastity_checkin',
  'bull_rating_dispute'
));

create or replace function public.notify_admins_bull_rating_dispute()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_user(p.id, 'bull_rating_dispute', new.bull_id, new.id)
  from public.profiles p
  where p.is_admin = true;
  return new;
end;
$$;
drop trigger if exists tr_notify_admins_bull_rating_dispute on public.bull_rating_disputes;
create trigger tr_notify_admins_bull_rating_dispute
  after insert on public.bull_rating_disputes
  for each row execute function public.notify_admins_bull_rating_dispute();

-- 4. Bull darf nur Nachrichten schreiben wenn verifiziert
create or replace function public.messages_check_bull_verified()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_verified boolean;
begin
  select p.role, p.verified into v_role, v_verified from public.profiles p where p.id = new.sender_id;
  if v_role = 'Bull' and (v_verified is null or v_verified = false) then
    raise exception 'Als Bull musst du verifiziert sein, um Nachrichten zu senden.';
  end if;
  return new;
end;
$$;
drop trigger if exists tr_messages_check_bull_verified on public.messages;
create trigger tr_messages_check_bull_verified
  before insert on public.messages
  for each row execute function public.messages_check_bull_verified();
