-- locked_at für Dauer-Anzeige; Status requested_by_sub für "Um Keuschhaltung bitten"

alter table public.chastity_arrangements
  add column if not exists locked_at timestamptz;

-- Status um 'requested_by_sub' erweitern (Sub bittet Dom)
alter table public.chastity_arrangements
  drop constraint if exists chastity_arrangements_status_check;
alter table public.chastity_arrangements
  add constraint chastity_arrangements_status_check
  check (status in ('pending', 'active', 'paused', 'ended', 'requested_by_sub'));

-- reward_goal_points darf 0 sein bei requested_by_sub (Dom setzt später)
alter table public.chastity_arrangements
  drop constraint if exists chastity_arrangements_reward_goal_points_check;
alter table public.chastity_arrangements
  add constraint chastity_arrangements_reward_goal_points_check
  check (reward_goal_points >= 0);

-- Beim Wechsel auf 'active': locked_at setzen, falls noch null
create or replace function public.chastity_set_locked_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    new.locked_at := coalesce(new.locked_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists chastity_arrangements_set_locked_at on public.chastity_arrangements;
create trigger chastity_arrangements_set_locked_at
  before update on public.chastity_arrangements
  for each row
  execute function public.chastity_set_locked_at();

-- Insert erlauben: Dom (wie bisher) ODER Sub bei status 'requested_by_sub'
drop policy if exists "chastity_arrangements_insert" on public.chastity_arrangements;
create policy "chastity_arrangements_insert" on public.chastity_arrangements
  for insert with check (
    auth.uid() = dom_id
    or (auth.uid() = sub_id and status = 'requested_by_sub')
  );
