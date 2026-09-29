# Formulier-verzender (Cloudflare Worker + Resend)

Vervangt FormSubmit. Het offerteformulier op `contact.html` post naar deze Worker. De Worker
mailt de aanvraag via Resend naar info@partyklik.com, met de aanvrager als Reply-To, zodat
"Beantwoorden" rechtstreeks naar de klant gaat. Beide diensten zijn gratis voor dit gebruik
(Resend: 3.000 mails per maand, Cloudflare Workers: 100.000 verzoeken per dag).

- Ontvanger staat vast in de Worker; het formulier kan hem niet wijzigen.
- Alleen verzoeken vanaf partyklik.nl worden aangenomen; het honeypot-veld `_honey` vangt bots.
- **De Resend-sleutel staat nooit in deze repo** (die is publiek), alleen als secret in Cloudflare.

## Eenmalig instellen (±20 minuten)

### 1. Resend: domein en sleutel

1. Maak een gratis account op https://resend.com.
2. **Domains → Add domain** → `partyklik.nl`, regio **Ireland (eu-west-1)**.
3. Resend toont drie DNS-records. Zet ze bij TransIP → Domeinen → partyklik.nl → DNS. Kopieer
   de waarden precies uit Resend. Het gaat om ongeveer:

   | Naam | Type | Waarde |
   |---|---|---|
   | `send` | MX | `feedback-smtp.eu-west-1.amazonses.com` (prioriteit 10) |
   | `send` | TXT | `v=spf1 include:amazonses.com ~all` |
   | `resend._domainkey` | TXT | lange sleutel, begint met `p=` |

   Let op: zet het type in TransIP goed (standaard staat het op A). Het null-MX- en
   SPF-record op `@` blijven zoals ze zijn; deze records staan op subdomeinen.
4. Klik in Resend op **Verify**. Na een paar minuten staat het domein op *Verified*.
5. **API Keys → Create API key**: rechten *Sending access*, domein `partyklik.nl`. Kopieer de
   sleutel (begint met `re_`); je ziet hem maar één keer.

### 2. Cloudflare: de Worker

1. Maak een gratis account op https://dash.cloudflare.com (een creditcard is niet nodig).
2. **Workers & Pages → Create → Create Worker** (Hello World). Naam: `partyklik-formulier` → **Deploy**.
3. **Edit code**: vervang alles door de inhoud van `src/index.js` uit deze map → **Deploy**.
4. **Settings → Variables and Secrets → Add**:
   - Type *Secret*, naam `RESEND_API_KEY`, waarde: de sleutel uit stap 1.5.
   - Type *Text*, naam `TO`, waarde: **je eigen e-mailadres**, zodat de test niet bij Arjan landt.
5. Noteer de URL van de Worker, iets als `https://partyklik-formulier.<jouw-naam>.workers.dev`.

### 3. Testen en omzetten

1. Geef Claude de Worker-URL. Die zet de `action` van het formulier om, werkt de
   privacyverklaring bij en test met een onderschepte verzending.
2. Eerste echte test: die gaat naar je eigen adres (variabele `TO`).
3. Klopt het, verwijder dan de variabele `TO` in Cloudflare. Vanaf dat moment gaat alles naar
   info@partyklik.com. Doe daarna hooguit één eindtest naar Arjan, en alleen in overleg.

Liever via de opdrachtregel: `npx wrangler deploy` en `npx wrangler secret put RESEND_API_KEY`
in deze map.

## Hoe het antwoordt

| Situatie | HTTP | Body |
|---|---|---|
| Verstuurd (of honeypot ingevuld) | 200 | `{"success":true}` |
| Naam leeg of e-mailadres ongeldig | 400 | `{"success":false}` |
| Niet vanaf partyklik.nl | 403 | `{"success":false}` |
| Resend weigert of is onbereikbaar | 502 | `{"success":false}` |
| `RESEND_API_KEY` ontbreekt | 500 | `{"success":false}` |

Bij `success:false` toont `contact.html` het vangnet: een melding met voorgevulde mail- en
WhatsApp-link. Foutmeldingen van Resend staan in Cloudflare onder de Worker → **Logs**.
