-- Bucket auf öffentlich stellen, damit Anhänge per getPublicUrl() abrufbar sind.
-- Die Objekt-Pfade sind nicht erratbar (conversation_id + UUID). Upload/Delete bleiben per RLS geschützt.

update storage.buckets
set public = true
where id = 'message-attachments';
