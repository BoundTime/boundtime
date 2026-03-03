-- Bewertungen: Auch Frauen (Single) dürfen bewerten und sehen; Bewerten nur wenn verifiziert

-- Frauen dürfen Bewertungen sehen (wie Paare)
drop policy if exists "bull_ratings_select_woman" on public.bull_ratings;
create policy "bull_ratings_select_woman" on public.bull_ratings
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.gender = 'Frau')
  );

-- Bewerten dürfen nur: (Paar ODER Frau) UND verifiziert
drop policy if exists "bull_ratings_insert" on public.bull_ratings;
create policy "bull_ratings_insert" on public.bull_ratings
  for insert with check (
    rater_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.verified = true
        and (p.account_type = 'couple' or p.gender = 'Frau')
    )
    and exists (select 1 from public.profiles b where b.id = bull_id and b.role = 'Bull')
  );
