-- In-App-Benachrichtigungen: Tabelle + RLS + Trigger

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  related_user_id uuid references public.profiles(id) on delete set null,
  related_id uuid,
  constraint notifications_type_check check (type in (
    'new_message',
    'new_follower',
    'profile_view',
    'post_like',
    'profile_like',
    'chastity_new_task',
    'chastity_task_awaiting_confirmation',
    'chastity_reward_request',
    'chastity_deadline_soon'
  ))
);

create index notifications_user_id_read_at on public.notifications(user_id, read_at);
create index notifications_user_id_created_at on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- Einfügen nur über definer-Funktion (Trigger)
create or replace function public.notify_user(
  p_user_id uuid,
  p_type text,
  p_related_user_id uuid default null,
  p_related_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, related_user_id, related_id)
  values (p_user_id, p_type, p_related_user_id, p_related_id);
end;
$$;

-- Trigger: Neuer Follower
create or replace function public.notify_new_follower()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_user(new.following_id, 'new_follower', new.follower_id, null);
  return new;
end;
$$;
drop trigger if exists tr_notify_new_follower on public.follows;
create trigger tr_notify_new_follower after insert on public.follows
  for each row execute function public.notify_new_follower();

-- Trigger: Neue Nachricht (Empfänger benachrichtigen)
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_other uuid;
begin
  select case when c.participant_a = new.sender_id then c.participant_b else c.participant_a end
  into v_other from public.conversations c where c.id = new.conversation_id;
  if v_other is not null and v_other != new.sender_id then
    perform public.notify_user(v_other, 'new_message', new.sender_id, new.conversation_id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_new_message on public.messages;
create trigger tr_notify_new_message after insert on public.messages
  for each row execute function public.notify_new_message();

-- Trigger: Profilbesuch
create or replace function public.notify_profile_view()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_user(new.profile_id, 'profile_view', new.viewer_id, null);
  return new;
end;
$$;
drop trigger if exists tr_notify_profile_view on public.profile_views;
create trigger tr_notify_profile_view after insert on public.profile_views
  for each row execute function public.notify_profile_view();

-- Bei UPDATE (on conflict do update) wird kein INSERT ausgelöst; nur bei echtem INSERT wird benachrichtigt.
-- record_profile_view macht upsert – bei "do update" gibt es keinen Zeilen-INSERT, also keinen Trigger.
-- Wir benachrichtigen nur bei erstem Besuch (insert). Optional: in record_profile_view explizit notify aufrufen für "do update" – hier nur Insert-Trigger.

-- Trigger: Post-Like (Autor benachrichtigen)
create or replace function public.notify_post_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  if v_author is not null and v_author != new.user_id then
    perform public.notify_user(v_author, 'post_like', new.user_id, new.post_id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_post_like on public.post_likes;
create trigger tr_notify_post_like after insert on public.post_likes
  for each row execute function public.notify_post_like();

-- Trigger: Profil-Like
create or replace function public.notify_profile_like()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_user(new.profile_id, 'profile_like', new.liker_id, null);
  return new;
end;
$$;
drop trigger if exists tr_notify_profile_like on public.profile_likes;
create trigger tr_notify_profile_like after insert on public.profile_likes
  for each row execute function public.notify_profile_like();

-- Trigger: Neue Chastity-Aufgabe (Sub benachrichtigen)
create or replace function public.notify_chastity_new_task()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sub_id uuid;
begin
  if new.status = 'pending' then
    select sub_id into v_sub_id from public.chastity_arrangements where id = new.arrangement_id;
    if v_sub_id is not null then
      perform public.notify_user(v_sub_id, 'chastity_new_task', new.created_by, new.id);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_new_task on public.chastity_tasks;
create trigger tr_notify_chastity_new_task after insert on public.chastity_tasks
  for each row execute function public.notify_chastity_new_task();

-- Trigger: Aufgabe wartet auf Dom-Bestätigung
create or replace function public.notify_chastity_task_awaiting_confirmation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_dom_id uuid;
begin
  if new.status = 'awaiting_confirmation' and (old.status is null or old.status != 'awaiting_confirmation') then
    select dom_id into v_dom_id from public.chastity_arrangements where id = new.arrangement_id;
    if v_dom_id is not null then
      perform public.notify_user(v_dom_id, 'chastity_task_awaiting_confirmation', new.created_by, new.id);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_task_awaiting_confirmation on public.chastity_tasks;
create trigger tr_notify_chastity_task_awaiting_confirmation after update on public.chastity_tasks
  for each row execute function public.notify_chastity_task_awaiting_confirmation();

-- Trigger: Belohnungsanfrage (Dom benachrichtigen)
create or replace function public.notify_chastity_reward_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_dom_id uuid;
begin
  if new.status = 'pending' then
    select dom_id into v_dom_id from public.chastity_arrangements where id = new.arrangement_id;
    if v_dom_id is not null then
      perform public.notify_user(v_dom_id, 'chastity_reward_request', new.requested_by, new.id);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_reward_request on public.chastity_reward_requests;
create trigger tr_notify_chastity_reward_request after insert on public.chastity_reward_requests
  for each row execute function public.notify_chastity_reward_request();

-- chastity_deadline_soon: RPC erzeugt Benachrichtigungen für Sub, wenn Aufgabe in <24h fällig (idempotent: max. eine pro Task pro Tag)
create or replace function public.create_deadline_soon_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select t.id as task_id
    from public.chastity_tasks t
    join public.chastity_arrangements a on a.id = t.arrangement_id
    where a.sub_id = auth.uid()
      and t.status = 'pending'
      and t.due_date is not null
      and t.due_date >= current_date
      and t.due_date <= current_date + 1
      and not exists (
        select 1 from public.notifications n
        where n.user_id = auth.uid() and n.type = 'chastity_deadline_soon'
          and n.related_id = t.id::uuid
          and n.created_at >= current_date
      )
  loop
    perform public.notify_user(auth.uid(), 'chastity_deadline_soon', null, r.task_id);
  end loop;
end;
$$;
grant execute on function public.create_deadline_soon_notifications() to authenticated;
