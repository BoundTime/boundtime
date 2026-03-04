-- Art des Paars (nur bei account_type = 'couple' relevant)
alter table public.profiles
  add column if not exists couple_type text
  check (couple_type is null or couple_type in ('man_woman', 'man_man', 'woman_woman'));

comment on column public.profiles.couple_type is 'Nur bei Paar-Account: man_woman, man_man, woman_woman';

-- Trigger-Funktion: couple_type aus user_metadata übernehmen
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_type text := case when new.raw_user_meta_data->>'account_type' = 'couple' then 'couple' else 'single' end;
  v_couple_type text := null;
  v_gender text;
  v_role text;
begin
  if v_account_type = 'couple' then
    v_couple_type := new.raw_user_meta_data->>'couple_type';
    if v_couple_type not in ('man_woman', 'man_man', 'woman_woman') then
      v_couple_type := 'man_woman';
    end if;
    v_gender := 'Divers';
    v_role := 'Switcher';
  else
    v_gender := coalesce(new.raw_user_meta_data->>'gender', 'Divers');
    v_role := coalesce(new.raw_user_meta_data->>'role', 'Switcher');
  end if;

  insert into public.profiles (id, nick, gender, role, date_of_birth, account_type, couple_type)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nick'), ''), 'user_' || left(new.id::text, 8)),
    v_gender,
    v_role,
    case
      when new.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data->>'date_of_birth')::date
      else null
    end,
    v_account_type,
    v_couple_type
  );
  return new;
end;
$$;
