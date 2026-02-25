-- Dom darf Zufalls-Checks löschen

create policy "chastity_random_checks_delete" on public.chastity_random_checks
  for delete using (
    exists (select 1 from public.chastity_arrangements a
            where a.id = arrangement_id and a.dom_id = auth.uid())
  );
