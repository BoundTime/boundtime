-- Benachrichtigung: Dom wird informiert, wenn Sub um Keuschhaltung bittet
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message', 'new_follower', 'profile_view', 'post_like', 'profile_like',
  'photo_like', 'photo_comment', 'verification_rejected',
  'chastity_new_task', 'chastity_task_awaiting_confirmation', 'chastity_reward_request',
  'chastity_deadline_soon', 'chastity_arrangement_offer', 'chastity_sub_request'
));

create or replace function public.notify_chastity_sub_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'requested_by_sub' and new.dom_id is not null and new.dom_id != new.sub_id then
    perform public.notify_user(new.dom_id, 'chastity_sub_request', new.sub_id, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_sub_request on public.chastity_arrangements;
create trigger tr_notify_chastity_sub_request
  after insert on public.chastity_arrangements
  for each row execute function public.notify_chastity_sub_request();
