# Moskee Website met Kennisbank - Setup Guide

## 🚀 Wat is er toegevoegd?

### Nieuwe Features
- ✅ **React Router** voor multi-page navigatie
- ✅ **Supabase integratie** voor kennisbank artikelen
- ✅ **Kennisbank pagina** met artikel overzicht
- ✅ **Artikel detail pagina** met mooie layout
- ✅ **SQL schema** voor Supabase database

## 📁 Nieuwe Bestanden

```
src/
  ├── pages/
  │   ├── Home.jsx              # Homepage (oude App.jsx content)
  │   ├── Kennisbank.jsx        # Artikel overzicht pagina
  │   └── ArticleDetail.jsx     # Individueel artikel pagina
  ├── hooks/
  │   └── useArticles.js        # Custom hooks voor Supabase data
  ├── supabaseClient.js         # Supabase configuratie
  └── config.js                 # Updated met Supabase config

supabase-schema.sql             # SQL schema voor database
.env.example                    # Voorbeeld environment variables
```

## 🔧 Setup Instructies

### Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een account aan
2. Klik op "New Project"
3. Vul project naam, database wachtwoord en regio in
4. Wacht tot het project is aangemaakt (~2 minuten)

### Stap 2: Database Schema Deployen

1. In je Supabase dashboard, ga naar **SQL Editor**
2. Klik op "New Query"
3. Kopieer de volledige inhoud van `supabase-schema.sql`
4. Plak in de SQL editor en klik op "Run"
5. Je database tabellen zijn nu aangemaakt! ✅

### Stap 3: API Keys Ophalen

1. Ga naar **Project Settings** (tandwiel icoon)
2. Klik op **API** in het menu
3. Kopieer:
   - `Project URL` (iets zoals: `https://abcdefgh.supabase.co`)
   - `anon/public` key (een lange string)

### Stap 4: Environment Variables Instellen

1. Maak een nieuw bestand `.env` in de root van je project
2. Kopieer de inhoud van `.env.example`
3. Vul je eigen Supabase credentials in:

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key-hier
```

### Stap 5: Development Server Starten

```bash
npm run dev
```

## 📝 Artikelen Beheren

### Optie 1: Via Supabase Dashboard (Eenvoudig)

1. Ga naar **Table Editor** in Supabase
2. Selecteer de `articles` tabel
3. Klik op "Insert" > "Insert row"
4. Vul de velden in:
   - **title**: Titel van het artikel
   - **slug**: URL-vriendelijke versie (bijv: `ramadan-tips`)
   - **excerpt**: Korte samenvatting
   - **content**: Volledige artikel content (HTML toegestaan)
   - **image_url**: URL naar een afbeelding
   - **author**: Naam van de auteur
   - **category**: Categorie (bijv: `gebed`, `ramadan`)
   - **is_published**: `true` om te publiceren
   - **published_at**: Publicatie datum

### Optie 2: Via SQL (Bulk import)

```sql
INSERT INTO articles (title, slug, excerpt, content, image_url, author, category, is_published, published_at) 
VALUES (
  'De vijf zuilen van Islam',
  'vijf-zuilen-van-islam',
  'Leer over de fundamentele vijf zuilen van Islam.',
  '<h2>Shahada</h2><p>Het geloofsgetuigenis...</p>',
  'https://images.unsplash.com/photo-1...',
  'Imam Hassan',
  'islam-basics',
  true,
  NOW()
);
```

## 🎨 Content Tips

### Afbeeldingen
- Gebruik gratis afbeeldingen van [Unsplash](https://unsplash.com)
- Zoek op: "mosque", "quran", "islamic art", "prayer"
- Kopieer de image URL en plak in `image_url` veld

### HTML Content
De `content` veld ondersteunt HTML voor rijke formatting:

```html
<h2>Hoofdstuk titel</h2>
<p>Eerste paragraaf met <strong>dikgedrukte tekst</strong>.</p>

<ul>
  <li>Eerste punt</li>
  <li>Tweede punt</li>
</ul>

<blockquote>
  Dit is een quote of belangrijk punt
</blockquote>
```

## 🔒 Beveiliging

Het SQL schema bevat **Row Level Security (RLS)** policies:
- ✅ Iedereen kan gepubliceerde artikelen lezen
- ✅ Alleen ingelogde gebruikers kunnen artikelen aanmaken/bewerken
- ✅ Onzichtbare artikelen (`is_published = false`) zijn privé

## 🎯 Volgende Stappen

1. **Admin Panel**: Bouw een admin panel om artikelen via de website te beheren
2. **Categorieën**: Voeg filtering toe op categorieën
3. **Zoekfunctie**: Implementeer zoeken in artikelen
4. **Comments**: Voeg reacties toe aan artikelen
5. **Rich Text Editor**: Integreer een WYSIWYG editor (bijv. TipTap, Quill)

## 📚 Routes

- `/` - Homepage met gebedstijden en info
- `/kennisbank` - Overzicht van alle artikelen
- `/kennisbank/artikel-slug` - Individueel artikel

## 🐛 Troubleshooting

### "Artikel niet gevonden" error
- Controleer of `is_published = true` in database
- Check of de slug correct is in de URL

### "Artikelen laden..." blijft hangen
- Check `.env` file met correcte Supabase credentials
- Open browser console (F12) voor error messages
- Verifieer dat tabellen bestaan in Supabase

### Styling issues
- Clear browser cache (Ctrl+Shift+R)
- Check of Tailwind correct is geconfigureerd

## 💡 Support

Heb je vragen of problemen? Check:
- [Supabase Documentatie](https://supabase.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
