-- Notification-Typen photo_like, photo_comment + Trigger

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message',
  'new_follower',
  'profile_view',
  'post_like',
  'profile_like',
  'photo_like',
  'photo_comment',
  'chastity_new_task',
  'chastity_task_awaiting_confirmation',
  'chastity_reward_request',
  'chastity_deadline_soon',
  'chastity_arrangement_offer'
));

-- Trigger: Foto-Like (Album-Besitzer benachrichtigen)
create or replace function public.notify_photo_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner_id uuid;
begin
  select a.owner_id into v_owner_id
  from public.photo_album_photos p
  join public.photo_albums a on a.id = p.album_id
  where p.id = new.photo_id;
  if v_owner_id is not null and v_owner_id != new.user_id then
    perform public.notify_user(v_owner_id, 'photo_like', new.user_id, new.photo_id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_photo_like on public.photo_album_photo_likes;
create trigger tr_notify_photo_like after insert on public.photo_album_photo_likes
  for each row execute function public.notify_photo_like();

-- Trigger: Foto-Kommentar (Album-Besitzer benachrichtigen)
create or replace function public.notify_photo_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner_id uuid;
begin
  select a.owner_id into v_owner_id
  from public.photo_album_photos p
  join public.photo_albums a on a.id = p.album_id
  where p.id = new.photo_id;
  if v_owner_id is not null and v_owner_id != new.user_id then
    perform public.notify_user(v_owner_id, 'photo_comment', new.user_id, new.photo_id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_photo_comment on public.photo_album_photo_comments;
create trigger tr_notify_photo_comment after insert on public.photo_album_photo_comments
  for each row execute function public.notify_photo_comment();
