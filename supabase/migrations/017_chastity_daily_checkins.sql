-- Tägliche Check-ins (Stimmung, Bericht)

create table if not exists public.chastity_daily_checkins (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  sub_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null,
  mood_value int check (mood_value >= 1 and mood_value <= 5),
  notes text,
  created_at timestamptz default now(),
  unique (arrangement_id, sub_id, checkin_date)
);

alter table public.chastity_daily_checkins enable row level security;
create policy "chastity_daily_checkins_select" on public.chastity_daily_checkins
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_daily_checkins_insert" on public.chastity_daily_checkins
  for insert with check (
    auth.uid() = sub_id and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.sub_id = auth.uid())
  );
create policy "chastity_daily_checkins_update" on public.chastity_daily_checkins
  for update using (
    auth.uid() = sub_id and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.sub_id = auth.uid())
  );

create index chastity_daily_checkins_arrangement on public.chastity_daily_checkins(arrangement_id);
create index chastity_daily_checkins_date on public.chastity_daily_checkins(checkin_date desc);
