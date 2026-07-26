-- 1) Revoke public RPC access to internal trigger functions (advisor findings)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_attorney_verification_fields() from public, anon, authenticated;

-- 2) Storage buckets
-- public bucket: attorney profile photos
insert into storage.buckets (id, name, public)
values ('attorney-photos', 'attorney-photos', true)
on conflict (id) do nothing;

-- private bucket: ID docs, bar card, board cert uploads (accessed via signed URLs)
insert into storage.buckets (id, name, public)
values ('attorney-documents', 'attorney-documents', false)
on conflict (id) do nothing;

-- Path convention for both buckets: {user_id}/{filename} — lets policies
-- check ownership via the first path segment.

create policy "attorney_photos_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "attorney_photos_owner_update"
  on storage.objects for update
  using (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "attorney_photos_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'attorney-photos' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "attorney_documents_owner_read"
  on storage.objects for select
  using (bucket_id = 'attorney-documents' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "attorney_documents_admin_read"
  on storage.objects for select
  using (bucket_id = 'attorney-documents' and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy "attorney_documents_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'attorney-documents' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- Note: no public SELECT policy on attorney-photos — public buckets serve
-- objects by direct URL without one; adding a broad SELECT policy only
-- enables storage.list() enumeration of every uploaded file, which the
-- Supabase advisor flags (public_bucket_allows_listing) and the app
-- doesn't need.
