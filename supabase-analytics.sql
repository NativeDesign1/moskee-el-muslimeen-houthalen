-- Analytics tracking table for website visitors
-- First, add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_views' AND column_name = 'country'
  ) THEN
    ALTER TABLE page_views ADD COLUMN country TEXT;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_views' AND column_name = 'city'
  ) THEN
    ALTER TABLE page_views ADD COLUMN city TEXT;
  END IF;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- RLS Policies
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous page view tracking" ON page_views;
DROP POLICY IF EXISTS "Allow authenticated users to read analytics" ON page_views;

-- Allow anyone to insert page views (for tracking)
CREATE POLICY "Allow anonymous page view tracking"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admin) can read analytics
CREATE POLICY "Allow authenticated users to read analytics"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a view for daily statistics
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT ip_address) as unique_visitors,
  COUNT(DISTINCT page_path) as pages_viewed
FROM page_views
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create a view for page statistics
CREATE OR REPLACE VIEW page_stats AS
SELECT 
  page_path,
  page_title,
  COUNT(*) as views,
  COUNT(DISTINCT ip_address) as unique_visitors
FROM page_views
GROUP BY page_path, page_title
ORDER BY views DESC;

-- Grant access to views for authenticated users
GRANT SELECT ON daily_stats TO authenticated;
GRANT SELECT ON page_stats TO authenticated;
