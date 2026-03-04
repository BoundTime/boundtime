-- Bei Paar Mann+Frau: wer steht an erster Stelle (date_of_birth)?
-- 'man' = date_of_birth gehört zum Mann, partner_date_of_birth zur Frau
-- 'woman' = date_of_birth gehört zur Frau, partner_date_of_birth zum Mann
alter table public.profiles
  add column if not exists couple_first_is text
  check (couple_first_is is null or couple_first_is in ('man', 'woman'));

comment on column public.profiles.couple_first_is is 'Nur bei Paar Mann+Frau: wer ist erste Person (date_of_birth). man | woman';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_type text := case when new.raw_user_meta_data->>'account_type' = 'couple' then 'couple' else 'single' end;
  v_couple_type text := null;
  v_couple_first_is text := null;
  v_gender text;
  v_role text;
  v_partner_dob date := null;
begin
  if v_account_type = 'couple' then
    v_couple_type := new.raw_user_meta_data->>'couple_type';
    if v_couple_type not in ('man_woman', 'man_man', 'woman_woman') then
      v_couple_type := 'man_woman';
    end if;
    v_gender := 'Divers';
    v_role := 'Switcher';
    if v_couple_type = 'man_woman' then
      v_couple_first_is := new.raw_user_meta_data->>'couple_first_is';
      if v_couple_first_is not in ('man', 'woman') then
        v_couple_first_is := 'man';
      end if;
    end if;
    if new.raw_user_meta_data->>'partner_date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$' then
      v_partner_dob := (new.raw_user_meta_data->>'partner_date_of_birth')::date;
    end if;
  else
    v_gender := coalesce(new.raw_user_meta_data->>'gender', 'Divers');
    v_role := coalesce(new.raw_user_meta_data->>'role', 'Switcher');
  end if;

  insert into public.profiles (id, nick, gender, role, date_of_birth, account_type, couple_type, couple_first_is, partner_date_of_birth)
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
    v_couple_type,
    v_couple_first_is,
    v_partner_dob
  );
  return new;
end;
$$;
