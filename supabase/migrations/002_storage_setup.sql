-- Migration for Supabase Storage buckets and security policies

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('team_documents', 'team_documents', false, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2. Enable RLS on storage.objects (standard Supabase pattern)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for `avatars` bucket
-- Public read access for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars into a folder named after their user ID or team ID
CREATE POLICY "Authenticated users can upload avatar images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Users can update/delete their own avatar uploads
CREATE POLICY "Users can update avatar images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() = owner));

CREATE POLICY "Users can delete avatar images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() = owner));

-- 4. RLS Policies for `team_documents` bucket
-- Team members (or team leaders) can read team documents
-- File path pattern: team_id/filename
CREATE POLICY "Team members can view team documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'team_documents' AND
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id::text = (storage.foldername(name))[1]
    AND team_members.user_id = auth.uid()
  )
);

-- Team members can upload team documents to their team folder
CREATE POLICY "Team members can upload team documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team_documents' AND
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id::text = (storage.foldername(name))[1]
    AND team_members.user_id = auth.uid()
  )
);

-- Document owner or team leader can delete team documents
CREATE POLICY "Team members can delete team documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team_documents' AND (
    auth.uid() = owner OR
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id::text = (storage.foldername(name))[1]
      AND teams.leader_id = auth.uid()
    )
  )
);
