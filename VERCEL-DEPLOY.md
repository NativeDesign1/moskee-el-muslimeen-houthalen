# Vercel Deployment Guide

## 📦 Stap 1: Voorbereiding

### Zorg dat je project klaar is:
- ✅ `.env` is in `.gitignore` (check!)
- ✅ `.env.example` bestaat met placeholder waarden
- ✅ Alle code is gecommit naar Git

## 🚀 Stap 2: Vercel Deployment

### Optie A: Via Vercel Dashboard (Makkelijkste)

1. **Ga naar [vercel.com](https://vercel.com)** en log in met GitHub

2. **Klik op "Add New Project"**

3. **Import je Git repository:**
   - Selecteer je GitHub repository
   - Klik "Import"

4. **Configure Project:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables toevoegen:**
   Klik op "Environment Variables" en voeg toe:
   
   ```
   Name: VITE_SUPABASE_URL
   Value: https://xgnhpsbvtlfugvdrwctm.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnbmhwc2J2dGxmdWd2ZHJ3Y3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzUwNDMsImV4cCI6MjA1MDQ1MTA0M30.cTIm0eYO_IjJolqUzwfEoA_my16Wj-lDqTqhmhC_hQM
   ```
   
   ⚠️ **Belangrijk**: Voeg deze toe voor **alle environments** (Production, Preview, Development)

6. **Klik op "Deploy"** 🚀

### Optie B: Via Vercel CLI

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Voeg environment variables toe
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Re-deploy
vercel --prod
```

## ⚙️ Stap 3: Environment Variables instellen (Manual)

Als je environment variables later wilt aanpassen:

1. Ga naar je project op [vercel.com](https://vercel.com)
2. Klik op **Settings** > **Environment Variables**
3. Voeg toe of wijzig:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Selecteer **Production**, **Preview**, en **Development**
5. Klik **Save**
6. **Re-deploy** je project (Settings > Deployments > ... > Redeploy)

## 📝 Stap 4: Custom Domain (Optioneel)

1. Ga naar **Settings** > **Domains**
2. Voeg je custom domain toe (bijv. `moskee-houthalen.be`)
3. Update je DNS records bij je domain provider:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## 🔐 Stap 5: Supabase Setup Checklist

Zorg ervoor dat je de volgende stappen in Supabase hebt gedaan:

### Database Schema
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/xgnhpsbvtlfugvdrwctm/sql/new)
2. Kopieer en run `supabase-schema.sql`
3. Kopieer en run `supabase-storage.sql`

### Admin User
1. Ga naar **Authentication** > **Users**
2. Klik **Add user** > **Create new user**
3. Vul email en wachtwoord in
4. ✅ Vink **Auto Confirm User** aan
5. Klik **Create user**

### Storage Bucket
1. Ga naar **Storage** > **Policies**
2. Controleer dat `article-images` bucket bestaat
3. Controleer dat policies correct zijn (public read, authenticated write)

## ✅ Stap 6: Test je Deployment

1. **Open je Vercel URL** (bijv. `your-project.vercel.app`)
2. **Test de homepagina** - moet direct werken
3. **Test kennisbank** - moet artikelen tonen (als je schema hebt gedeployed)
4. **Test admin login** - ga naar `/admin` en log in

## 🔄 Automatic Deployments

Na de eerste deployment:
- ✅ **Elke push naar `main`** → Automatisch deployed naar Production
- ✅ **Elke push naar andere branches** → Preview deployment
- ✅ **Pull requests** → Preview URL in comments

## 🐛 Troubleshooting

### "VITE_SUPABASE_URL is not defined"
- Check of environment variables correct zijn gespeld (met `VITE_` prefix!)
- Re-deploy na het toevoegen van env vars

### "Could not find the table 'public.articles'"
- Deploy `supabase-schema.sql` in Supabase SQL Editor
- Check Supabase URL en API key

### Admin login werkt niet
- Zorg dat je een user hebt aangemaakt in Supabase Authentication
- Check of "Auto Confirm User" was aangevinkt

### Afbeeldingen uploaden werkt niet
- Deploy `supabase-storage.sql` voor storage bucket
- Check storage policies in Supabase Dashboard

## 📊 Monitoring

- **Analytics**: Vercel dashboard > Analytics
- **Logs**: Vercel dashboard > Functions > Logs
- **Performance**: Vercel dashboard > Speed Insights

## 🎉 Klaar!

Je moskee website is nu live op Vercel! 🚀

**Next steps:**
- Voeg custom domain toe
- Maak content aan in admin dashboard
- Deel de link met je gemeenschap
