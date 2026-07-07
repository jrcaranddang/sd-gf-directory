-- Storage buckets for PetMotion (spec §4/§5)

-- Private bucket for user-uploaded pet photos. Only the owner (folder = uid)
-- may read/write. Edge Functions use the service role to read for submission.
insert into storage.buckets (id, name, public)
values ('pet-uploads', 'pet-uploads', false)
on conflict (id) do nothing;

-- Public bucket for generated result videos and template previews. Provider
-- URLs expire in ~24h, so get-job copies the finished video here on success.
insert into storage.buckets (id, name, public)
values ('pet-results', 'pet-results', true)
on conflict (id) do nothing;

-- pet-uploads: owner-scoped by first path segment == auth.uid()
drop policy if exists "uploads owner read" on storage.objects;
create policy "uploads owner read" on storage.objects
  for select using (
    bucket_id = 'pet-uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "uploads owner write" on storage.objects;
create policy "uploads owner write" on storage.objects
  for insert with check (
    bucket_id = 'pet-uploads' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- pet-results: public read (videos are shareable); writes are service-role only.
drop policy if exists "results public read" on storage.objects;
create policy "results public read" on storage.objects
  for select using (bucket_id = 'pet-results');
