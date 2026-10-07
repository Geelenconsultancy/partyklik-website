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
| `contact.html` | Offerteformulier en contactinfo |
| `formulier-worker/` | Verzender van het offerteformulier (Cloudflare Worker + Resend); draait apart bij Cloudflare |
| `privacy.html` | Privacy- en cookieverklaring |
| `algemene-voorwaarden.html` | Algemene voorwaarden (16 artikelen) |
| `assets/` | CSS, JS, geoptimaliseerde foto's en fonts |

## Deploy

De site draait op GitHub Pages: elke merge naar `main` wordt automatisch uitgerold naar https://partyklik.nl (custom domain via `CNAME`). `sitemap.xml` en `robots.txt` staan in de root. Het offerteformulier post naar een aparte Cloudflare Worker; hoe je die beheert staat in `formulier-worker/README.md`.
