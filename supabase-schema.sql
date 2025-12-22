-- Supabase SQL Schema voor Kennisbank Artikelen
-- Deploy dit in je Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel voor kennisbank artikelen
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  author VARCHAR(100),
  category VARCHAR(50) DEFAULT 'algemeen',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snellere queries
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);

-- Tabel voor artikel categorieën (optioneel)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger voor updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public kan gepubliceerde artikelen lezen
CREATE POLICY "Gepubliceerde artikelen zijn publiek leesbaar"
  ON articles FOR SELECT
  USING (is_published = true);

-- Authenticated users kunnen alle artikelen lezen (voor admin panel)
CREATE POLICY "Authenticated users kunnen alle artikelen zien"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

-- Alleen authenticated users kunnen artikelen aanmaken/bewerken
CREATE POLICY "Authenticated users kunnen artikelen aanmaken"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users kunnen artikelen bewerken"
  ON articles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users kunnen artikelen verwijderen"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Categories zijn publiek leesbaar
CREATE POLICY "Categories zijn publiek leesbaar"
  ON categories FOR SELECT
  USING (true);

-- Alleen authenticated users kunnen categories beheren
CREATE POLICY "Authenticated users kunnen categories aanmaken"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Voorbeeld data (optioneel - verwijder of pas aan naar wens)
INSERT INTO categories (name, slug, description) VALUES
  ('Islam Basics', 'islam-basics', 'Fundamentele kennis over Islam'),
  ('Gebed', 'gebed', 'Alles over het gebed'),
  ('Ramadan', 'ramadan', 'Informatie over Ramadan'),
  ('Algemeen', 'algemeen', 'Algemene artikelen')
ON CONFLICT (slug) DO NOTHING;

-- Voorbeeld artikel
INSERT INTO articles (title, slug, excerpt, content, image_url, author, category, is_published, published_at) VALUES
  (
    'Welkom bij de Kennisbank',
    'welkom-bij-de-kennisbank',
    'Ontdek de kennisbank van onze moskee met artikelen over Islam, gebed en meer.',
    '<p>Welkom bij onze kennisbank! Hier vind je artikelen over verschillende onderwerpen gerelateerd aan Islam.</p><p>We zullen regelmatig nieuwe artikelen toevoegen over onderwerpen zoals:</p><ul><li>De vijf zuilen van Islam</li><li>Het belang van het gebed</li><li>Ramadan en vasten</li><li>Islamitische geschiedenis</li></ul><p>Blijf regelmatig terugkomen voor nieuwe content!</p>',
    'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800',
    'Admin',
    'algemeen',
    true,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- ====================================
-- ADMIN USER SETUP
-- ====================================
-- Maak een admin account aan via de Supabase Dashboard:
-- 1. Ga naar Authentication > Users
-- 2. Klik op "Add user" > "Create new user"
-- 3. Vul email in: admin@moskee.com (of je eigen email)
-- 4. Vul wachtwoord in: kies een veilig wachtwoord
-- 5. Auto Confirm User: JA (aanvinken)
-- 
-- Of gebruik deze query (vervang email en wachtwoord):
-- Deze moet je uitvoeren in de Supabase SQL Editor NA het runnen van bovenstaande schema

-- BELANGRIJK: Gebruik Supabase Dashboard om admin user aan te maken!
-- Auth gebruikers kunnen niet via SQL worden aangemaakt.
