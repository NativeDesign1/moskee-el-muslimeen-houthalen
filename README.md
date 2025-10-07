# Marokkaanse Moskee Houthalen — React + Tailwind (Vite)

Een minimalistische 1-pagina site in React en Tailwind, klaar om later uit te breiden (extra pagina's, nieuws, lessen, donaties).

## Snel starten
```bash
npm i
npm run dev
# build
npm run build && npm run preview
```

## Gebedstijden (live via Aladhan)
- Locatie staat in `src/config.js` (lat/lng). Standaard: Houthalen, België.
- In de sectie *Gebedstijden* kies je methode (MWL, ISNA, UOIF, …) en madhhab (Shafi/Hanafi).
- Data komt van Aladhan API.

## Doneren (Stripe Payment Links)
- Maak in Stripe 3 Payment Links (bijv. €5, €10, €20) en plak de URL's in `src/config.js` (`DONATION_LINKS`).
- Optioneel: gebruik een Payment Link met variabel bedrag en plak in `CUSTOM_BASE`.
- Klikken opent de Payment Link in een nieuw tabblad.

## Google Maps
- Eenvoudige Google Maps embed met zoekterm “Marokkaanse Moskee Houthalen”.
- Je kunt dit vervangen door een exacte Place embed of OpenStreetMap/Leaflet.
