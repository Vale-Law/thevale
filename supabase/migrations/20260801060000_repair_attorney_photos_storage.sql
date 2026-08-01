-- Repairs the attorney-photos storage bucket + RLS policies. Written
-- idempotent (safe to run whether or not 20260726021500_security_
-- hardening_and_storage.sql's storage section ever actually ran against
-- this database) because attorneys are hitting "new row violates row-
-- level security policy" on profile-photo upload, which only happens
-- when the bucket exists but its insert policy is missing or doesn't
-- match -- exactly what you'd see if that original migration's storage
-- statements were never applied here. The policy logic itself is
-- unchanged from that migration; this only guarantees it's actually
-- present.
insert into storage.buckets (id, name, public)
values ('attorney-photos', 'attorney-photos', true)
on conflict (id) do nothing;

drop policy if exists "attorney_photos_owner_write" on storage.objects;
create policy "attorney_photos_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "attorney_photos_owner_update" on storage.objects;
create policy "attorney_photos_owner_update"
  on storage.objects for update
  using (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "attorney_photos_owner_delete" on storage.objects;
create policy "attorney_photos_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- No public SELECT policy, deliberately (unchanged from the original
-- migration): the bucket is public, so Supabase serves objects by direct
-- URL without going through RLS at all. Adding a broad SELECT policy here
-- would only enable storage.list() enumeration of every uploaded file
-- (the Supabase advisor's public_bucket_allows_listing finding) for no
-- benefit -- the booking page's profile card already reads photos via
-- the public URL returned by UploadFile(), same as the attorney portal.
