# PartyKlik — website

Statische website voor [PartyKlik](https://partyklik.nl): verhuur van een bemande Magic Mirror Photobooth en lichtletters in Zeist en omgeving.

## Lokaal bekijken

Geen build-stap nodig. Start een statische server in deze map, bijvoorbeeld:

```bash
python -m http.server 8000
```

en open http://localhost:8000.

## Structuur

| Pad | Inhoud |
|---|---|
| `index.html` | Homepage met hero, USP's, pakketten en galerij |
| `pakketten.html` | Prijzen en pakketten (Basic/Standaard/Premium) |
| `over-ons.html` | Het verhaal van PartyKlik |
| `projecten.html` | Galerij, samenwerkingen en toekomstplannen |
| `faq.html` | Veelgestelde vragen (incl. FAQPage-schema) |
| `contact.html` | Offerteformulier (FormSubmit) en contactinfo |
| `privacy.html` | Privacy- en cookieverklaring |
| `algemene-voorwaarden.html` | Algemene voorwaarden (16 artikelen) |
| `assets/` | CSS, JS, geoptimaliseerde foto's en fonts |

## Deploy

Upload de volledige inhoud van deze map naar de webroot van de hosting. `sitemap.xml` en `robots.txt` staan in de root; het formulier vereist eenmalige activatie van FormSubmit door de eigenaar van info@partyklik.com.
