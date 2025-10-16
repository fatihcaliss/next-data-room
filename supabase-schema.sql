-- Data Room Database Schema
-- Run this in your Supabase SQL editor

-- Note: auth.users already has RLS enabled by default in Supabase

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create helper function to check if a folder has valid shared links
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION has_valid_shared_link(folder_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM shared_links sl
    WHERE sl.user_id = folder_user_id
      AND (sl.expires_at IS NULL OR sl.expires_at > NOW())
  );
END;
$$;

-- Enable RLS on tables
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "View folders policy" ON folders;
DROP POLICY IF EXISTS "Users can view their own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert their own folders" ON folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON folders;
DROP POLICY IF EXISTS "Public can view shared folders" ON folders;

DROP POLICY IF EXISTS "View files policy" ON files;
DROP POLICY IF EXISTS "Users can view their own files" ON files;
DROP POLICY IF EXISTS "Users can insert their own files" ON files;
DROP POLICY IF EXISTS "Users can update their own files" ON files;
DROP POLICY IF EXISTS "Users can delete their own files" ON files;
DROP POLICY IF EXISTS "Public can view files in shared folders" ON files;

DROP POLICY IF EXISTS "View shared links policy" ON shared_links;
DROP POLICY IF EXISTS "Users can view their own shared links" ON shared_links;
DROP POLICY IF EXISTS "Anyone can view shared links for validation" ON shared_links;
DROP POLICY IF EXISTS "Users can create their own shared links" ON shared_links;
DROP POLICY IF EXISTS "Users can delete their own shared links" ON shared_links;

-- RLS Policies for folders
-- Users can see their own folders OR folders from users with valid shared links
CREATE POLICY "View folders policy" ON folders
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    has_valid_shared_link(user_id)
  );

CREATE POLICY "Users can insert their own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for files
-- Users can see their own files OR files from users with valid shared links
CREATE POLICY "View files policy" ON files
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    has_valid_shared_link(user_id)
  );

CREATE POLICY "Users can insert their own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shared_links
-- Anyone can read shared_links for validation (needed for public access)
CREATE POLICY "View shared links policy" ON shared_links
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own shared links" ON shared_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared links" ON shared_links
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket (skip if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      has_valid_shared_link(((storage.foldername(name))[1])::uuid)
    )
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON folders(user_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON folders(parent_id);
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
CREATE INDEX IF NOT EXISTS files_folder_id_idx ON files(folder_id);
CREATE INDEX IF NOT EXISTS shared_links_token_idx ON shared_links(token);
CREATE INDEX IF NOT EXISTS shared_links_folder_id_idx ON shared_links(folder_id);
