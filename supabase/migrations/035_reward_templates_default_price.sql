-- Standard-Preise pro Belohnungstyp (Orientierung für Dom beim Anlegen von Katalog-Items)
-- Skala: Klein 10–30, Mittel 40–80, Groß 100–200, Sehr groß 250+ BD

alter table public.chastity_reward_templates
  add column if not exists default_price_bound_dollars int default 50;

comment on column public.chastity_reward_templates.default_price_bound_dollars is
  'Vorschlagspreis (BD) beim Anlegen eines Katalog-Items mit dieser Vorlage';

update public.chastity_reward_templates set default_price_bound_dollars = 150 where title = 'Orgasmus-Erlaubnis';
update public.chastity_reward_templates set default_price_bound_dollars = 100 where title = 'Edging-Erlaubnis';
update public.chastity_reward_templates set default_price_bound_dollars = 60 where title = 'Kurzzeit-Unlock';
update public.chastity_reward_templates set default_price_bound_dollars = 150 where title = 'Treffen mit der Dom';
update public.chastity_reward_templates set default_price_bound_dollars = 60 where title = 'Video-Call';
update public.chastity_reward_templates set default_price_bound_dollars = 20 where title = 'Foto der Dom';
update public.chastity_reward_templates set default_price_bound_dollars = 15 where title = 'Sprachnachricht';
update public.chastity_reward_templates set default_price_bound_dollars = 25 where title = 'Bettzeit verschieben';
update public.chastity_reward_templates set default_price_bound_dollars = 20 where title = 'Film/Serie schauen';
