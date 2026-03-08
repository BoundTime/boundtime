-- pgcrypto wird für gen_salt() und crypt() (Restriction-Passwort-Hash) benötigt.
-- Ohne diese Erweiterung: "function gen_salt(unknown) does not exist"
-- Migration 075 sorgt dafür, dass die RPCs auch finden, wenn pgcrypto im Schema "extensions" liegt (Supabase).
create extension if not exists pgcrypto;
