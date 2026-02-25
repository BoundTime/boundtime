-- Zufalls-Check: Dom löst aus, Sub liefert Beweis binnen Frist

create table if not exists public.chastity_random_checks (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  requested_at timestamptz not null default now(),
  deadline_at timestamptz not null,
  status text not null check (status in ('pending', 'completed', 'failed')) default 'pending',
  proof_photo_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.chastity_random_checks enable row level security;
create policy "chastity_random_checks_select" on public.chastity_random_checks
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_random_checks_insert" on public.chastity_random_checks
  for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_random_checks_update" on public.chastity_random_checks
  for update using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );

create index chastity_random_checks_arrangement on public.chastity_random_checks(arrangement_id);
create index chastity_random_checks_status on public.chastity_random_checks(status);

-- Abgelaufene Checks als failed markieren
create or replace function public.expire_overdue_random_checks()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chastity_random_checks
  set status = 'failed'
  where status = 'pending' and deadline_at < now();
end;
$$;
grant execute on function public.expire_overdue_random_checks() to authenticated;
