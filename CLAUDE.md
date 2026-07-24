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
- Contact: info@partyklik.com. Geen boekings-/betaalmodule (bewust buiten scope).
- Offerteformulier post naar FormSubmit (info@partyklik.com) met redirect naar `bedankt.html`.

## SEO
- Elke pagina heeft eigen title/description/canonical/OG-tags; `sitemap.xml` en `robots.txt` in de root.
- JSON-LD: LocalBusiness op de homepage, FAQPage op `faq.html`. Houd die synchroon met zichtbare content.
- Doelzoekwoorden: "photobooth huren Zeist/Utrecht", "magic mirror huren", "spiegel photobooth bruiloft/bedrijfsfeest".
- Bij SEO-wijzigingen: pas zichtbare tekst én metadata samen aan; nooit keyword-stuffing — de toon blijft menselijk.

## Beheer
- Eigenaar: Sjors Geelen (Geelen Consultancy, sjors@sebero.nl); klant: Arjan (PartyKlik).
- Deploy: statisch uploaden naar hosting; domein partyklik.nl staat bij TransIP.
