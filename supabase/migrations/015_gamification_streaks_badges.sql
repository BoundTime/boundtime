-- Gamification: Streaks, Level, Badges

-- 1. Streaks pro Arrangement
alter table public.chastity_arrangements
  add column if not exists current_streak_days int default 0 check (current_streak_days >= 0);
alter table public.chastity_arrangements
  add column if not exists longest_streak_days int default 0 check (longest_streak_days >= 0);

-- 2. Badge-Definitionen
create table if not exists public.chastity_badge_definitions (
  id text primary key,
  title text not null,
  description text,
  icon_emoji text default '🏆',
  sort_order int default 0
);

alter table public.chastity_badge_definitions enable row level security;
create policy "chastity_badge_definitions_select" on public.chastity_badge_definitions
  for select using (true);

insert into public.chastity_badge_definitions (id, title, description, icon_emoji, sort_order)
values
  ('first_week', 'Erste Woche durchgehalten', '7 Tage ohne Verfehlung', '🌟', 1),
  ('100_bd', '100 BD verdient', '100 BoundDollars erspielt', '💰', 2),
  ('30_days_locked', '30 Tage verschlossen', '30 Tage effektiv gesperrt', '🔒', 3),
  ('streak_7', '7-Tage-Streak', '7 Tage in Folge alle Aufgaben erledigt', '🔥', 4),
  ('first_reward', 'Erste Belohnung', 'Erste Belohnung abgeholt', '🎁', 5)
on conflict (id) do nothing;

-- 3. Erworbene Badges (pro Arrangement/Sub)
create table if not exists public.chastity_badges_earned (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  badge_id text not null references public.chastity_badge_definitions(id) on delete cascade,
  earned_at timestamptz default now(),
  unique (arrangement_id, badge_id)
);

alter table public.chastity_badges_earned enable row level security;
create policy "chastity_badges_earned_select" on public.chastity_badges_earned
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );

create index chastity_badges_earned_arrangement on public.chastity_badges_earned(arrangement_id);
