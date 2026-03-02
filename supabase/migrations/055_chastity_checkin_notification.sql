-- Benachrichtigung: Dom wird informiert, wenn Sub einen täglichen Check-in abgibt

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message', 'new_follower', 'profile_view', 'post_like', 'profile_like',
  'photo_like', 'photo_comment', 'verification_rejected',
  'chastity_new_task', 'chastity_task_awaiting_confirmation', 'chastity_reward_request',
  'chastity_deadline_soon', 'chastity_arrangement_offer', 'chastity_sub_request', 'chastity_checkin'
));

create or replace function public.notify_chastity_checkin()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_dom_id uuid;
begin
  select a.dom_id into v_dom_id
  from public.chastity_arrangements a
  where a.id = new.arrangement_id;
  if v_dom_id is not null and v_dom_id != new.sub_id then
    perform public.notify_user(v_dom_id, 'chastity_checkin', new.sub_id, new.arrangement_id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_checkin on public.chastity_daily_checkins;
create trigger tr_notify_chastity_checkin
  after insert on public.chastity_daily_checkins
  for each row execute function public.notify_chastity_checkin();
