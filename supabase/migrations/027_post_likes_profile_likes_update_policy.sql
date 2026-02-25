-- UPDATE-Policies für Upsert (post_likes + profile_likes)
-- Erlaubt "ON CONFLICT DO UPDATE" beim Like-Button, damit doppelte Klicks keinen Fehler werfen.

create policy "post_likes_update" on public.post_likes
  for update using (auth.uid() = user_id);

create policy "profile_likes_update" on public.profile_likes
  for update using (auth.uid() = liker_id);
