-- „Wen suchst du?“ als Mehrfachauswahl (Mann, Frau, Divers)
alter table public.profiles
  add column if not exists looking_for_genders text[];

comment on column public.profiles.looking_for_genders is 'Mehrfachauswahl: Wen sucht die Person (Mann, Frau, Divers)';

-- Bestehende Einzelauswahl übernehmen
update public.profiles
set looking_for_genders = case
  when looking_for_gender = 'alle' then array['Mann', 'Frau', 'Divers']
  when looking_for_gender is not null and looking_for_gender <> '' then array[looking_for_gender]
  else null
end
where looking_for_genders is null and (looking_for_gender is not null or looking_for_gender = 'alle');
