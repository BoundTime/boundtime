-- Notification-Typ verification_rejected + Trigger
-- Der Ablehnungsgrund (Kommentar) wird in verifications.note gespeichert
-- und auf der Verifizierungs-Seite angezeigt.

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message',
  'new_follower',
  'profile_view',
  'post_like',
  'profile_like',
  'photo_like',
  'photo_comment',
  'verification_rejected',
  'chastity_new_task',
  'chastity_task_awaiting_confirmation',
  'chastity_reward_request',
  'chastity_deadline_soon',
  'chastity_arrangement_offer'
));

-- Trigger: Verifizierung abgelehnt – User benachrichtigen
create or replace function public.notify_verification_rejected()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'rejected' and (old.status is null or old.status != 'rejected') then
    perform public.notify_user(new.user_id, 'verification_rejected', new.reviewed_by, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_verification_rejected on public.verifications;
create trigger tr_notify_verification_rejected after update on public.verifications
  for each row execute function public.notify_verification_rejected();
