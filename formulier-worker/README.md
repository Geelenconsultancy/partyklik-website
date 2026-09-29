# Formulier-verzender (Cloudflare Worker + Resend)

Vervangt FormSubmit. Het offerteformulier op `contact.html` post naar deze Worker. De Worker
mailt de aanvraag via Resend naar info@partyklik.com, met de aanvrager als Reply-To, zodat
"Beantwoorden" rechtstreeks naar de klant gaat. Beide diensten zijn gratis voor dit gebruik
(Resend: 3.000 mails per maand, Cloudflare Workers: 100.000 verzoeken per dag).

- Ontvanger staat vast in de Worker; het formulier kan hem niet wijzigen.
- Alleen verzoeken vanaf partyklik.nl worden aangenomen; het honeypot-veld `_honey` vangt bots.
- **De Resend-sleutel staat nooit in deze repo** (die is publiek), alleen als secret in Cloudflare.

## Stand

Live sinds 29 september 2026.

| Onderdeel | Waar |
|---|---|
| Worker | `partyklik-formulier` in het Cloudflare-account van Sjors → https://partyklik-formulier.geelenconsultancy.workers.dev |
| Secret `RESEND_API_KEY` | Resend-sleutel *partyklik-formulier (Cloudflare Worker)*: alleen *sending access*, alleen voor partyklik.nl |
| Resend-domein | `partyklik.nl`, regio eu-west-1 (Ierland), open- en kliktracking uit |
| Afzender | `PartyKlik website <formulier@partyklik.nl>` |

De DNS-records voor Resend staan bij TransIP (Domeinen → partyklik.nl → DNS), op subdomeinen.
Het null-MX- en SPF-record op `@` blijven daardoor ongemoeid. Haal deze records niet weg,
anders stopt het formulier met mailen:

| Naam | Type | Waarde |
|---|---|---|
| `resend._domainkey` | TXT | DKIM-sleutel, begint met `p=` (staat in Resend onder Domains) |
| `send` | MX | `10 feedback-smtp.eu-west-1.amazonses.com.` |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` |
| `rsend` | CNAME | `send.forge.rmta.net.` |

## Beheer

Code aanpassen en opnieuw uitrollen, in deze map (met een Cloudflare-token met het sjabloon
*Edit Cloudflare Workers* in `CLOUDFLARE_API_TOKEN`):

    npx wrangler deploy

- `wrangler deploy` zet de variabelen zoals `wrangler.toml` ze beschrijft en wist variabelen
  die alleen in het dashboard staan. Het secret blijft wel staan.
- **Testen naar een ander adres** dan info@partyklik.com: rol tijdelijk uit met
  `npx wrangler deploy --var TO:jouw@adres.nl`, test met curl (met de header
  `Origin: https://partyklik.nl`) en rol daarna opnieuw uit zonder `--var`. Dan is `TO` weg en
  gaat alles weer naar info@partyklik.com. Zet `TO` niet in het dashboard; de volgende deploy
  wist hem ongemerkt.
- **Sleutel vervangen**: maak in Resend een nieuwe sleutel met *Sending access* voor
  partyklik.nl, zet hem met `npx wrangler secret put RESEND_API_KEY` en trek daarna de oude in.
- Foutmeldingen van Resend zie je live in Cloudflare onder de Worker → **Logs**, of met
  `npx wrangler tail`.

## Hoe het antwoordt

| Situatie | HTTP | Body |
|---|---|---|
| Verstuurd (of honeypot ingevuld) | 200 | `{"success":true}` |
| Naam leeg of e-mailadres ongeldig | 400 | `{"success":false}` |
| Niet vanaf partyklik.nl | 403 | `{"success":false}` |
| Resend weigert of is onbereikbaar | 502 | `{"success":false}` |
| `RESEND_API_KEY` ontbreekt | 500 | `{"success":false}` |

Bij `success:false` toont `contact.html` het vangnet: een melding met voorgevulde mail- en
WhatsApp-link.
