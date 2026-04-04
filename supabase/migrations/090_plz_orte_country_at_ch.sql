-- AT/CH: plz_orte.country + flexiblere PLZ (4–5 Ziffern); Profil: address_country

alter table public.plz_orte drop constraint if exists plz_orte_plz_check;

alter table public.plz_orte
  add column if not exists country text not null default 'DE'
    check (country in ('DE', 'AT', 'CH'));

update public.plz_orte set country = 'DE' where country is null;

alter table public.plz_orte
  add constraint plz_orte_plz_valid check (
    char_length(plz) between 4 and 5 and plz ~ '^\d+$'
  );

create index if not exists plz_orte_country_plz_idx on public.plz_orte (country, plz);

comment on table public.plz_orte is 'Postleitzahlen und Orte (DE/AT/CH) für Autocomplete; DE 5-stellig, AT/CH 4-stellig.';

-- profiles: PLZ 4–5 Ziffern + Land
alter table public.profiles drop constraint if exists profiles_postal_code_check;
alter table public.profiles
  add constraint profiles_postal_code_valid check (
    postal_code is null
    or (char_length(postal_code) between 4 and 5 and postal_code ~ '^\d+$')
  );

alter table public.profiles drop constraint if exists profiles_current_postal_code_check;
alter table public.profiles
  add constraint profiles_current_postal_code_valid check (
    current_postal_code is null
    or (
      char_length(current_postal_code) between 4 and 5
      and current_postal_code ~ '^\d+$'
    )
  );

alter table public.profiles
  add column if not exists address_country text not null default 'DE'
    check (address_country in ('DE', 'AT', 'CH'));

comment on column public.profiles.address_country is 'Land des Wohnorts (wie gewählte PLZ/Ort-Datenbasis).';

alter table public.profiles
  add column if not exists current_address_country text
    check (current_address_country is null or current_address_country in ('DE', 'AT', 'CH'));

comment on column public.profiles.current_address_country is 'Land des optionalen Zweitorts.';

-- Beispieldaten AT/CH (vollständige Listen per CSV + seed-plz-orte.mjs)
insert into public.plz_orte (plz, ort, bundesland, country)
select v.plz, v.ort, v.bl, v.c
from (
  values
    ('1010', 'Wien', 'Wien', 'AT'),
    ('1020', 'Wien', 'Wien', 'AT'),
    ('4020', 'Linz', 'Oberösterreich', 'AT'),
    ('8010', 'Graz', 'Steiermark', 'AT'),
    ('6020', 'Innsbruck', 'Tirol', 'AT'),
    ('5020', 'Salzburg', 'Salzburg', 'AT'),
    ('9020', 'Klagenfurt am Wörthersee', 'Kärnten', 'AT'),
    ('6850', 'Dornbirn', 'Vorarlberg', 'AT'),
    ('3100', 'St. Pölten', 'Niederösterreich', 'AT'),
    ('6800', 'Feldkirch', 'Vorarlberg', 'AT'),
    ('8001', 'Zürich', 'Zürich', 'CH'),
    ('8004', 'Zürich', 'Zürich', 'CH'),
    ('3000', 'Bern', 'Bern', 'CH'),
    ('1201', 'Genève', 'Genève', 'CH'),
    ('4000', 'Basel', 'Basel-Stadt', 'CH'),
    ('4051', 'Basel', 'Basel-Stadt', 'CH'),
    ('6000', 'Luzern', 'Luzern', 'CH'),
    ('6900', 'Lugano', 'Ticino', 'CH'),
    ('1003', 'Lausanne', 'Vaud', 'CH'),
    ('1950', 'Sion', 'Valais', 'CH')
) as v(plz, ort, bl, c)
where not exists (
  select 1 from public.plz_orte p
  where p.country = v.c and p.plz = v.plz and p.ort = v.ort
);
