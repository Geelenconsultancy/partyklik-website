# PartyKlik website

Statische marketingwebsite voor PartyKlik — verhuur van een bemande Magic Mirror Photobooth en lichtletters, gevestigd in Zeist (regio Utrecht). Live op https://partyklik.nl.

## Stack & structuur
- Puur statisch: HTML + CSS + vanilla JS, geen build-stap of framework.
- `assets/css/style.css` — volledige huisstijl (design tokens in `:root`).
- `assets/js/main.js` — mobiel menu en lightbox.
- `assets/img/` — geoptimaliseerde foto's (`*-800.jpg` voor thumbnails, `*-1600.jpg` voor lightbox/hero). Bronbestanden staan buiten de repo in `../content/fotos/`.
- Fonts self-hosted in `assets/fonts/` (AVG-vriendelijk, geen Google Fonts CDN).

## Afspraken
- Taal: Nederlands, tutoyeren ("je/jullie"), warme toon. Slogan: "Maak herinneringen. Lach samen. Bewaar het moment."
- Alle prijzen **inclusief btw**: Basic €449, Standaard €549 (meest gekozen), Premium €699. Reiskosten: 30 km vanaf Zeist gratis, daarna €0,45/km. Partytent buitenlocatie €95. Extra uur: €120 vooraf geboekt, €150 bij verlengen op de dag zelf (staat in voorwaarden art. 4, `pakketten.html` en `faq.html` — wijzig samen).
- USP altijd benoemen: de booth is **altijd bemand door een host** — complete beleving, geen doe-het-zelf-apparaat.
- Contact: info@partyklik.com, +31 6 10 64 31 76, WhatsApp, Instagram https://www.instagram.com/party_klik/. KvK 42034187, btw NL005445685B98. **Geen straatadres op de site** (wens van de klant) — alleen Zeist. Geen boekings-/betaalmodule (bewust buiten scope).
- Offerteformulier verstuurt via `fetch` (script onderaan `contact.html`) naar onze eigen verzender: de Cloudflare Worker in `formulier-worker/` (https://partyklik-formulier.geelenconsultancy.workers.dev), die via Resend mailt naar info@partyklik.com met de aanvrager als Reply-To. Beheer en uitrollen: zie `formulier-worker/README.md`. Bij `{"success":true}` door naar `bedankt.html`; bij elke fout (serverfout, geen verbinding, geen JSON, time-out na 20 s) een melding in `.form-status` met een voorgevulde mail- en WhatsApp-link, uit het sjabloon `#formulier-fout`. Enige verborgen veld: het honeypot-veld `_honey`. Veldnamen in het formulier en `VELDEN` in de Worker horen bij elkaar — wijzig ze samen.
- De Resend-sleutel hoort alleen als secret in Cloudflare, nooit in deze repo (die is publiek) en nooit in de chat.
- Test het formulier altijd met een onderschepte `fetch`: elke echte inzending landt in de zakelijke inbox van de klant. Test de Worker zelf alleen met `wrangler deploy --var TO:…` naar een eigen adres (zie de README).

## Juridisch
- `privacy.html` en `algemene-voorwaarden.html`; vanaf elke pagina bereikbaar via `.footer-legal`.
- **Geen cookiebanner toevoegen.** De site plaatst geen tracking- of advertentiecookies; alleen `sessionStorage` (`pk-intro`) voor de intro-animatie, en functionele opslag is vrijgesteld van toestemming (art. 11.7a lid 3 Telecommunicatiewet). Een banner zou toestemming vragen voor iets wat niet gebeurt.
- Daaruit volgt een harde regel: **geen externe scripts, fonts, pixels, embeds of kaarten toevoegen.** Doe je dat toch, dan wordt een cookiebanner verplicht én klopt de cookieparagraaf in `privacy.html` niet meer.
- Alle bedrijfsgegevens zijn ingevuld (sinds 29 september 2026 geen `{{MARKERS}}` meer). Komt er ooit weer een ontbrekend gegeven bij: markeer het met `<span class="fill">{{NAAM}}</span>` (geel, valt op) en zet het in `../INVULLEN.md`.
- Betaaltermijn en annuleringsstaffel staan op **drie** plekken: `algemene-voorwaarden.html` (art. 6 en 7), `faq.html` en de `price-note` in `pakketten.html`. Wijzig ze altijd samen.

## SEO
- Elke pagina heeft eigen title/description/canonical/OG-tags; `sitemap.xml` en `robots.txt` in de root.
- JSON-LD: LocalBusiness op de homepage, FAQPage op `faq.html`. Houd die synchroon met zichtbare content.
- Doelzoekwoorden: "photobooth huren Zeist/Utrecht", "magic mirror huren", "spiegel photobooth bruiloft/bedrijfsfeest".
- Bij SEO-wijzigingen: pas zichtbare tekst én metadata samen aan; nooit keyword-stuffing — de toon blijft menselijk.
- Interne links naar de homepage zijn `./`, nooit `index.html`. De canonical is `https://partyklik.nl/`; links naar `index.html` geven in Search Console "Alternatieve pagina met correcte canonieke tag".
- Uitzondering: `404.html` gebruikt overal root-paden (`/`, `/assets/...`, `/privacy.html`). GitHub Pages toont die pagina op elk onbekend pad, ook dieper (bv. `/a/b/`), en daar breken relatieve paden de stylesheet, het logo en de links. Kopieer je een header of footer naar `404.html`, zet de paden dan om.
- `bedankt.html` en `404.html` blijven uit Google via `<meta name="robots" content="noindex">`, niet via `robots.txt`: een geblokkeerde pagina kan Google niet lezen, dus dan ziet hij de noindex ook niet.
- Search Console meldt "Pagina met omleiding" (http/www → https://partyklik.nl), "Alternatieve pagina met correcte canonieke tag" (bv. `contact.html?pakket=…`) en "Uitgesloten door noindex-tag" (`bedankt.html`) als normale bijvangst. Daar hoef je niets aan te doen.
- Inhoud die met JS in beeld komt (zoals de stappen op de homepage) moet ook zichtbaar worden als het venster groter wordt, niet alleen bij scrollen: Googlebot scrolt niet.

## Beheer
- Eigenaar: Sjors Geelen (Geelen Consultancy, sjors@sebero.nl); klant: Arjan (PartyKlik).
- Deploy: GitHub Pages vanaf `main` (custom domain via `CNAME`); elke merge naar `main` wordt automatisch uitgerold (de Pages-build duurt ongeveer een minuut; GitHub Pages cachet tot 10 minuten). Domein partyklik.nl staat bij TransIP, met A-records naar GitHub Pages en `www` als CNAME naar `geelenconsultancy.github.io`.
