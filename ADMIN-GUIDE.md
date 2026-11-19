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

## Live khutbah op de tv

Open **Live khutbah** in het dashboard op de laptop die het geluid van de imam ontvangt. De module herkent korte spraakfragmenten uit het Standaardarabisch en de Marokkaanse Darija en vertaalt ze naar het Nederlands. Op elke tv met de schermpagina verschijnt dezelfde ondertiteling.

### Eenmalige inrichting

1. Voer [supabase-khutbah.sql](./supabase-khutbah.sql) uit in de SQL Editor van het bestaande Supabase-project.
2. Kopieer in **Authentication → Users** de User UID van de beheerder die de microfoon gaat bedienen. Vervang de voorbeeldwaarde in deze query en voer deze uit in dezelfde SQL Editor.

   ```sql
   insert into khutbah_private.operators (user_id)
   values ('VUL-HIER-DE-USER-UID-IN'::uuid)
   on conflict do nothing;
   ```

3. Gebruik in Vercel de servervariabele `OPENAI_API_KEY`. Voor de rechtstreekse audioverbinding heeft het OpenAI-project toegang nodig tot `gpt-realtime-2.1`. Bij een verbindingsprobleem of een onvolledig antwoord kan de server hetzelfde audiofragment verwerken met `gpt-audio-1.5` en zo nodig met `gpt-transcribe` en `gpt-6-luna`. Voor herstel kunnen extra API-kosten gelden. De bestaande Supabase-variabelen en SQL zijn ook geschikt voor de rechtstreekse verbinding. [Model en tarieven voor livevertaling](https://developers.openai.com/api/docs/models/gpt-realtime-2.1)
4. Open `/tv/khutbah` op elke tv en zet de browser op volledig scherm. Iedereen met die URL kan de actuele ondertiteling lezen. De lettergrootte is per tv instelbaar.

### Voor en tijdens de vrijdagpreek

1. Sluit de USB-audio-uitgang van het mengpaneel of een USB-audio-interface met een lijnsignaal van het mengpaneel aan op de laptop. Een ingebouwde microfoon werkt ook voor een eerste proef.
2. Open `/admin/live-khutbah` via HTTPS, geef de browser toegang tot de microfoon en kies de juiste geluidsingang. Spreek in de microfoon van de imam en controleer of de niveaumeter reageert. De microfoontest werkt lokaal.
3. Klik op **Start vertaling** en houd de beheerpagina open. Bij **Rechtstreekse audioverbinding** gaat het microfoongeluid tijdens het spreken naar OpenAI. Terwijl de imam verder spreekt, kan de vorige ondertitel worden afgerond. Bij **Fragmentverwerking** stuurt de laptop de opgenomen stukjes spraak afzonderlijk door. De moskeewebsite bewaart geen audioarchief.
   Onder de laatste ondertitel toont **Begin fragment tot publicatie** de tijd vanaf het begin van het opgenomen fragment tot de bevestiging door Supabase. De tv haalt de gepubliceerde regel daarna op. Supabase houdt één actuele ondertitel bij. Stoppen wist deze regel. Bij verlies van de beheerverbinding vervalt de uitzending na ongeveer een minuut.
4. Wacht na de laatste woorden tot de ondertitel verschijnt en klik op **Stop vertaling**. Stoppen sluit de microfoon direct en annuleert eventuele resterende fragmenten. Als ook de route via spraakherkenning geen bruikbare ondertitel oplevert, blijft de microfoon luisteren. Bij een onvolledig antwoord toont de beheerpagina of het probleem bij de spraakherkenning of bij de Nederlandse vertaling optrad. Test vóór de eerste vrijdag met een korte preek waarin de imam tussen Darija en Fusha wisselt, liefst met iemand die beide verstaat.

### Koran, hadith en shahada

Kies vóór **Start vertaling** hoe je op de tv wilt publiceren.

- **Livevertaling met broncontrole** vertaalt de gewone preek automatisch. Voor een herkend citaat uit de rechtstreekse audioverbinding controleert de server hetzelfde opgenomen fragment met aparte spraakherkenning. Alleen bij overeenstemming met een bekende brontekst kan de vaste Nederlandse regel verschijnen. Die extra controle kost tijd. Bij onduidelijkheid zie je een melding op de beheerpagina.
- **Alleen bronteksten die ik bevestig** laat je het herkende Arabisch en de vaste Nederlandse weergave vergelijken met wat je hoort. Klik op **Toon op tv** als ze overeenkomen of op **Sla over**. Gewone preektekst wordt in deze stand overgeslagen. De microfoon neemt langere stukken aaneengesloten recitatie op. Stop en start een nieuwe sessie om van stand te wisselen.

**Shahada.** Voor de zelfstandig uitgesproken woorden *lā ilāha illā Allāh* is de vaste betekenis “Niemand heeft het recht om aanbeden te worden behalve Allah.” Het getuigenis over Mohammed en de woorden “Ik getuig dat” verschijnen wanneer die ook in de herkende Arabische tekst staan. [Betekenis van de getuigenis bij Ibn Bāz](https://binbaz.org.sa/fatwas/6840)

**Koran.** Voor Al-Fātiḥah bevat de module eigen vaste Nederlandse betekenisweergaven. Bij het vierde vers worden de lezingen *Mālik* (Meester) en *Malik* (Koning) onderscheiden. Voor andere volledige verzen zoekt de module een eenduidige overeenkomst in de index van 6.236 verzen. De server controleert daarna het Arabisch van de uitgever en haalt de Nederlandse vertaling en eventuele voetnoten op. De bron ontvangt alleen het versnummer. Bij een onduidelijke overeenkomst, een onbereikbare bron of tekst die met voetnoten en bronvermelding te lang is voor het scherm, blijft het vers achterwege. [Lezingen van Al-Fātiḥah 1:4](https://quran.com/1/4/qiraat) · [Nederlandse editie van het Nederlands Islamitisch Centrum bij QuranEnc](https://quranenc.com/nl/browse/dutch_center)

**Hadith.** De vaste lijst bevat het begin van Ṣaḥīḥ Muslim 55a (*ad-dīn an-naṣīḥah*), de uitspraak over bedrog uit Ṣaḥīḥ Muslim 101 en de uitspraak over de Koran leren en onderwijzen uit Ṣaḥīḥ al-Bukhārī 5027. De bronvermelding hoort bij de vaste Nederlandse weergave. Andere als hadith herkende passages worden overgeslagen. De lijst kan in `lib/khutbah-guard.js` worden uitgebreid met het exacte Arabisch, de gecontroleerde betekenis en de vindplaats. [Muslim 55a](https://sunnah.com/muslim:55a) · [Muslim 101](https://sunnah.com/muslim:101) · [Al-Bukhārī 5027](https://sunnah.com/bukhari:5027)

Spraakherkenning kan een woord verkeerd verstaan of een onaangekondigd citaat als gewone spraak behandelen. Gebruik de stand met bevestiging als elke getoonde regel door iemand moet zijn gecontroleerd.

### Onvolledige zinnen en woordkeuze

Bij gewone preektekst kan één gedachte over twee audiofragmenten lopen. Als het eerste deel nog geen zelfstandige zin vormt, houdt de app het kort in het geheugen van de laptop. Met het direct aansluitende fragment doet de server één nieuwe poging op basis van beide opnames. Na een lange pauze, een weggevallen fragment of het stoppen van de uitzending vervalt die mogelijkheid. Bij een geslaagde poging staat onder de ondertitel **Samengevoegde zin**. Een volledige, duidelijke zin kan meteen naar de tv.

Klinkt een Nederlandse woordkeuze vreemd, open dan in de beheerpagina **Herkend Arabisch** onder de laatst gepubliceerde gewone ondertitel. Daar staat de Arabische tekst die de dienst in dat fragment heeft herkend. Zo kun je het herkende woord vergelijken met wat de imam zei. De publieke tv ontvangt alleen de Nederlandse ondertitel.

Voor lokaal testen van zowel de website als de Vercel-functie gebruik je `vercel dev` met de drie omgevingsvariabelen. Met alleen `npm run dev` kun je de microfoontest en de schermpagina testen.
