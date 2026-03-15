-- Koordinaten für Profilorte (Suchradius-Filter)
alter table public.profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.profiles.latitude is 'Breitengrad (Geocoding aus PLZ/Ort), für Suchradius-Filter';
comment on column public.profiles.longitude is 'Längengrad (Geocoding aus PLZ/Ort), für Suchradius-Filter';
