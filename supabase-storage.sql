-- Supabase Storage Setup voor Afbeeldingen en Video's
-- Deploy dit in je Supabase SQL Editor

-- Create storage bucket voor artikel media (afbeeldingen en video's)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  52428800, -- 50MB max voor video's
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies voor artikel afbeeldingen
-- Iedereen kan publieke afbeeldingen zien
CREATE POLICY "Publieke afbeeldingen zijn zichtbaar voor iedereen"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- Authenticated users kunnen afbeeldingen uploaden
CREATE POLICY "Authenticated users kunnen afbeeldingen uploaden"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Authenticated users kunnen hun eigen afbeeldingen verwijderen
CREATE POLICY "Authenticated users kunnen afbeeldingen verwijderen"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'article-images');

-- Authenticated users kunnen afbeeldingen updaten
CREATE POLICY "Authenticated users kunnen afbeeldingen updaten"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images');
