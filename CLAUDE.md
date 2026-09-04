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
- Alle prijzen **inclusief btw**: Basic €449, Standaard €549 (meest gekozen), Premium €699. Reiskosten: 30 km vanaf Zeist gratis, daarna €0,45/km. Partytent buitenlocatie €95.
- USP altijd benoemen: de booth is **altijd bemand door een host** — complete beleving, geen doe-het-zelf-apparaat.
- Contact: info@partyklik.com, +31 6 10 64 31 76, WhatsApp. Geen boekings-/betaalmodule (bewust buiten scope).
- Offerteformulier post naar FormSubmit (info@partyklik.com) met redirect naar `bedankt.html`. Verborgen velden: `_subject`, `_next`, `_template=table`, `_captcha=false`, `_replyto` (wordt door een script onderaan `contact.html` bij verzenden gevuld met het ingevulde e-mailadres — zonder dat werkt "Beantwoorden" niet) en het honeypot-veld `_honey`.

## Juridisch
- `privacy.html` en `algemene-voorwaarden.html`; vanaf elke pagina bereikbaar via `.footer-legal`.
- **Geen cookiebanner toevoegen.** De site plaatst geen tracking- of advertentiecookies; alleen `sessionStorage` (`pk-intro`) voor de intro-animatie, en functionele opslag is vrijgesteld van toestemming (art. 11.7a lid 3 Telecommunicatiewet). Een banner zou toestemming vragen voor iets wat niet gebeurt.
- Daaruit volgt een harde regel: **geen externe scripts, fonts, pixels, embeds of kaarten toevoegen.** Doe je dat toch, dan wordt een cookiebanner verplicht én klopt de cookieparagraaf in `privacy.html` niet meer.
- `{{MARKERS}}` in `<span class="fill">` zijn nog te leveren bedrijfsgegevens (KvK, btw-id). Zie `../INVULLEN.md`. Ze zijn expres geel gemarkeerd; laat ze staan tot de echte waarden er zijn.
- Betaaltermijn en annuleringsstaffel staan op **drie** plekken: `algemene-voorwaarden.html` (art. 6 en 7), `faq.html` en de `price-note` in `pakketten.html`. Wijzig ze altijd samen.

## SEO
- Elke pagina heeft eigen title/description/canonical/OG-tags; `sitemap.xml` en `robots.txt` in de root.
- JSON-LD: LocalBusiness op de homepage, FAQPage op `faq.html`. Houd die synchroon met zichtbare content.
- Doelzoekwoorden: "photobooth huren Zeist/Utrecht", "magic mirror huren", "spiegel photobooth bruiloft/bedrijfsfeest".
- Bij SEO-wijzigingen: pas zichtbare tekst én metadata samen aan; nooit keyword-stuffing — de toon blijft menselijk.

## Beheer
- Eigenaar: Sjors Geelen (Geelen Consultancy, sjors@sebero.nl); klant: Arjan (PartyKlik).
- Deploy: statisch uploaden naar hosting; domein partyklik.nl staat bij TransIP.
