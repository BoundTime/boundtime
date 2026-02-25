-- INSERT für plz_orte erlauben, damit das Seed-Skript (mit Anon-Key) die CSV-Daten einfügen kann.
-- Ohne diese Policy schlägt "Fehler beim Einfügen: new row violates row-level security policy" fehl.
create policy "plz_orte_insert" on public.plz_orte for insert to anon with check (true);
