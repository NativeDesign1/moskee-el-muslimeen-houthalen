# 🛠️ Admin Dashboard Setup

## Toegang tot het Admin Dashboard

Het admin dashboard is beschikbaar op: **`/admin/login`**

## 🔐 Admin Account Aanmaken

### Via Supabase Dashboard (Aanbevolen)

1. Log in op [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecteer je project
3. Ga naar **Authentication** > **Users** in het linker menu
4. Klik op **Add user** > **Create new user**
5. Vul in:
   - **Email**: `admin@moskee.com` (of je eigen email)
   - **Password**: Kies een veilig wachtwoord
   - **Auto Confirm User**: ✅ **Aanvinken!**
6. Klik op **Create user**

### Inloggen

1. Ga naar `http://localhost:5174/admin/login`
2. Gebruik de email en wachtwoord die je hebt aangemaakt
3. Na inloggen word je doorgestuurd naar het dashboard

## 📊 Admin Dashboard Features

### 🏠 Dashboard (`/admin/dashboard`)
- Overzicht van statistieken
- Snelle toegang tot alle functies
- Recente artikelen overzicht

### 📚 Kennisbank Beheer (`/admin/articles`)
- **Overzicht**: Bekijk alle artikelen
- **Filteren**: Filter op gepubliceerd/concept/alle
- **Publiceren/Verbergen**: Toggle met één klik
- **Bewerken**: Volledige editor voor artikelen
- **Verwijderen**: Artikelen verwijderen
- **Nieuw Artikel**: Maak nieuwe artikelen aan

### ✏️ Artikel Editor (`/admin/articles/new` & `/admin/articles/:id`)
Features:
- **Titel**: Hoofdtitel van het artikel
- **URL Slug**: Automatisch gegenereerd, aanpasbaar
- **Categorie**: Selecteer uit voorgedefinieerde categorieën
- **Auteur**: Naam van de schrijver
- **Afbeelding**: URL naar header afbeelding
- **Samenvatting**: Korte beschrijving voor overzichtspagina
- **Inhoud**: HTML editor voor rijke content
- **Publiceren**: Direct publiceren of als concept opslaan

### 🎯 Activiteiten (`/admin/activities`)
- Momenteel placeholder (in ontwikkeling)
- Activiteiten kunnen handmatig worden aangepast in de code

## 🎨 HTML Formatting in Artikelen

De content editor ondersteunt HTML. Gebruik deze tags:

```html
<!-- Paragraaf -->
<p>Dit is een paragraaf met tekst.</p>

<!-- Koppen -->
<h2>Hoofdstuk Titel</h2>
<h3>Subsectie Titel</h3>

<!-- Lijsten -->
<ul>
  <li>Eerste punt</li>
  <li>Tweede punt</li>
</ul>

<ol>
  <li>Genummerd punt 1</li>
  <li>Genummerd punt 2</li>
</ol>

<!-- Dikgedrukte tekst -->
<strong>Belangrijke tekst</strong>

<!-- Quote -->
<blockquote>
  Dit is een belangrijk citaat of opmerking
</blockquote>

<!-- Link -->
<a href="https://example.com">Link tekst</a>

<!-- Afbeelding in content -->
<img src="https://images.unsplash.com/..." alt="Beschrijving" />
```

## 🔒 Beveiliging

- **Protected Routes**: Alleen ingelogde gebruikers hebben toegang
- **Supabase Auth**: Veilige authenticatie via Supabase
- **RLS Policies**: Row Level Security op database niveau
- **Auto Logout**: Sessie verloopt automatisch

## 🚀 Workflow voor Content

### Nieuw Artikel Publiceren

1. Log in op `/admin/login`
2. Ga naar **Kennisbank** in het menu
3. Klik op **+ Nieuw Artikel**
4. Vul alle velden in:
   - Titel (verplicht)
   - Slug wordt automatisch gegenereerd
   - Kies categorie
   - Voeg auteur toe
   - Plak afbeelding URL (bijv. van Unsplash)
   - Schrijf een samenvatting
   - Voeg HTML content toe
5. Vink **Direct publiceren** aan als je het wilt publiceren
6. Klik op **Aanmaken**
7. Artikel is nu live op de website!

### Artikel Bewerken

1. Ga naar **Kennisbank** in het admin menu
2. Klik op **✏️ Bewerken** bij het artikel
3. Pas de gewenste velden aan
4. Klik op **Bijwerken**

### Artikel Verbergen/Publiceren

1. Ga naar **Kennisbank** in het admin menu
2. Klik op **👁️ Verbergen** of **✅ Publiceren**
3. Status wordt direct gewijzigd

## 📸 Afbeeldingen Vinden

### Gratis Stock Foto's

- [Unsplash](https://unsplash.com) - Zoek op "mosque", "quran", "islamic"
- [Pexels](https://pexels.com) - Gratis foto's
- [Pixabay](https://pixabay.com) - Royalty-free afbeeldingen

### Afbeelding URL Kopiëren (Unsplash)

1. Ga naar [unsplash.com](https://unsplash.com)
2. Zoek naar een afbeelding
3. Klik op de afbeelding
4. Klik rechts op **Download** dropdown
5. Rechtermuisklik op **Download free** > **Copy link address**
6. Plak de URL in het **Afbeelding URL** veld

## 🎯 Tips voor Goede Artikelen

1. **Duidelijke Titel**: Beschrijvend en informatief
2. **Goede Samenvatting**: Trek lezers aan met een goede excerpt
3. **Structuur**: Gebruik h2/h3 voor subsecties
4. **Leesbare Paragrafen**: Korte, heldere paragrafen
5. **Afbeelding**: Voeg altijd een relevante header afbeelding toe
6. **Categoriseer**: Kies de juiste categorie

## 🔧 Troubleshooting

### Kan niet inloggen
- Check of je admin account is aangemaakt in Supabase
- Controleer of "Auto Confirm User" was aangevinkt
- Check je email en wachtwoord

### Artikel wordt niet getoond op website
- Check of **is_published** is aangevinkt
- Ververs de publieke pagina
- Check browser console voor errors

### Afbeelding wordt niet getoond
- Check of de URL correct is
- Test de URL in een nieuwe browser tab
- Gebruik HTTPS URL's (niet HTTP)

### "Unauthorized" error
- Sessie kan zijn verlopen, log opnieuw in
- Check of Supabase credentials correct zijn in `.env`

## 📱 Mobile Support

Het admin dashboard is responsive en werkt op:
- ✅ Desktop (optimaal)
- ✅ Tablet
- ✅ Mobile (basis functionaliteit)

## 🚀 Toekomstige Features

- [ ] Rich Text WYSIWYG Editor (TipTap/Quill)
- [ ] Afbeelding upload (direct naar Supabase Storage)
- [ ] Activiteiten beheer systeem
- [ ] Gebruikers rollen (admin, editor, viewer)
- [ ] Content scheduling (plan publicatie datum)
- [ ] Analytics dashboard
- [ ] SEO optimalisatie tools

## 💡 Support

Voor vragen over het admin dashboard:
- Check de documentatie in dit bestand
- Bekijk [Supabase Docs](https://supabase.com/docs)
- Test functionaliteit in development mode eerst
