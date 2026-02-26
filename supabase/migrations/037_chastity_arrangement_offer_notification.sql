-- Benachrichtigung bei Keuschhaltungs-Anfrage an Sub
-- Typ chastity_arrangement_offer + Trigger für INSERT und UPDATE

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in (
  'new_message', 'new_follower', 'profile_view', 'post_like', 'profile_like',
  'chastity_new_task', 'chastity_task_awaiting_confirmation', 'chastity_reward_request',
  'chastity_deadline_soon', 'chastity_arrangement_offer'
));

-- Trigger: INSERT – Dom erstellt neue Anfrage
create or replace function public.notify_chastity_arrangement_offer_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' and new.sub_id is not null and new.dom_id != new.sub_id then
    perform public.notify_user(new.sub_id, 'chastity_arrangement_offer', new.dom_id, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_arrangement_offer_insert on public.chastity_arrangements;
create trigger tr_notify_chastity_arrangement_offer_insert
  after insert on public.chastity_arrangements
  for each row execute function public.notify_chastity_arrangement_offer_insert();

-- Trigger: UPDATE – Dom hat auf Sub-Bitte geantwortet und Bedingungen gesetzt
create or replace function public.notify_chastity_arrangement_offer_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' and new.sub_id is not null
     and (old.status is null or old.status != 'pending')
     and new.dom_id != new.sub_id then
    perform public.notify_user(new.sub_id, 'chastity_arrangement_offer', new.dom_id, new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists tr_notify_chastity_arrangement_offer_update on public.chastity_arrangements;
create trigger tr_notify_chastity_arrangement_offer_update
  after update on public.chastity_arrangements
  for each row execute function public.notify_chastity_arrangement_offer_update();
