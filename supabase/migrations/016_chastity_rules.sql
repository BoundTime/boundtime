-- Regeln der Dom

create table if not exists public.chastity_rules (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references public.chastity_arrangements(id) on delete cascade,
  rule_text text not null check (char_length(rule_text) > 0),
  sort_order int default 0,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.chastity_rules enable row level security;
create policy "chastity_rules_select" on public.chastity_rules
  for select using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and (a.dom_id = auth.uid() or a.sub_id = auth.uid()))
  );
create policy "chastity_rules_insert" on public.chastity_rules
  for insert with check (
    auth.uid() = created_by and
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_rules_update" on public.chastity_rules
  for update using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );
create policy "chastity_rules_delete" on public.chastity_rules
  for delete using (
    exists (select 1 from public.chastity_arrangements a where a.id = arrangement_id and a.dom_id = auth.uid())
  );

create index chastity_rules_arrangement on public.chastity_rules(arrangement_id);
