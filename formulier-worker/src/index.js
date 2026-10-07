// PartyKlik — offerteformulier-verzender (Cloudflare Worker).
//
// Ontvangt het formulier van partyklik.nl/contact.html en mailt de aanvraag via Resend
// naar info@partyklik.com, met de aanvrager als Reply-To. Antwoordt met
// {"success":true} of {"success":false}; contact.html toont bij false het vangnet.
// Een gewone formulier-POST vanaf partyklik.nl (JavaScript uit) krijgt geen JSON maar een
// pagina: bij succes een doorverwijzing naar bedankt.html, anders een foutpagina met
// hetzelfde vangnet.
//
// Instellingen (zie README.md in deze map):
//   RESEND_API_KEY  verplicht, als Secret. Nooit in deze (publieke) repo zetten.
//   TO              optioneel; standaard info@partyklik.com. Alleen om te testen, via
//                   `wrangler deploy --var TO:…`; de volgende gewone deploy wist hem.
//   FROM            optioneel; standaard "Offerteformulier PartyKlik <formulier@partyklik.nl>".
//
// De ontvanger staat vast in de Worker en komt nooit uit het formulier, zodat niemand
// deze Worker kan misbruiken om naar andere adressen te mailen.

const STANDAARD_TO = "info@partyklik.com";
const STANDAARD_FROM = "Offerteformulier PartyKlik <formulier@partyklik.nl>";
const TOEGESTANE_HERKOMST = ["https://partyklik.nl", "https://www.partyklik.nl"];
const BEDANKT = "https://partyklik.nl/bedankt.html";

// Velden uit het formulier, in de volgorde van de mail. Alles daarbuiten negeren we.
const VELDEN = ["Naam", "E-mail", "Telefoon", "Datum", "Soort evenement", "Soort evenement (toelichting)", "Pakket", "Locatie", "Bericht"];
const PAKKETTEN = { basic: "Basic — €449", standaard: "Standaard — €549", premium: "Premium — €699" };
const MAX_LENGTE = { Bericht: 5000 };
const MAX_LENGTE_STANDAARD = 300;

function corsHeaders(herkomst) {
  const h = { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Accept, Content-Type", Vary: "Origin" };
  if (TOEGESTANE_HERKOMST.includes(herkomst)) h["Access-Control-Allow-Origin"] = herkomst;
  return h;
}

function antwoord(status, gelukt, herkomst) {
  return new Response(JSON.stringify({ success: gelukt }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(herkomst) },
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Leest en schoont de velden op, zonder te controleren.
function schoonOp(form) {
  const a = {};
  for (const veld of VELDEN) {
    let v = form.get(veld);
    v = typeof v === "string" ? v.trim() : "";
    if (veld !== "Bericht") v = v.replace(/\s+/g, " ");
    a[veld] = v.slice(0, MAX_LENGTE[veld] || MAX_LENGTE_STANDAARD);
  }
  if (a.Pakket) a.Pakket = PAKKETTEN[a.Pakket] || "";
  if (!a.Pakket) a.Pakket = "Nog geen voorkeur";
  a.Datum = a.Datum.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3-$2-$1");
  return a;
}

// Geeft null terug als de verplichte velden niet kloppen.
export function leesAanvraag(form) {
  const a = schoonOp(form);
  if (!a.Naam || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a["E-mail"])) return null;
  return a;
}

export function maakMail(a) {
  const regels = VELDEN.filter((v) => a[v]);
  const text =
    "Nieuwe offerteaanvraag via partyklik.nl\n\n" +
    regels.map((v) => (v === "Bericht" ? `\n${v}:\n${a[v]}` : `${v}: ${a[v]}`)).join("\n") +
    "\n\nBeantwoorden gaat rechtstreeks naar de aanvrager.";
  // Regeleinden als <br>: Outlook voor Windows negeert white-space:pre-wrap.
  const rijen = regels
    .map(
      (v) =>
        `<tr><th style="text-align:left;vertical-align:top;padding:6px 12px 6px 0;white-space:nowrap">${escapeHtml(v)}</th>` +
        `<td style="padding:6px 0">${escapeHtml(a[v]).replace(/\r?\n/g, "<br>")}</td></tr>`
    )
    .join("");
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1b1720">` +
    `<p><strong>Nieuwe offerteaanvraag via partyklik.nl</strong></p>` +
    `<table style="border-collapse:collapse">${rijen}</table>` +
    `<p style="color:#57505f;font-size:13px">Beantwoorden gaat rechtstreeks naar de aanvrager.</p></div>`;
  return { subject: `Nieuwe offerteaanvraag via partyklik.nl — ${a.Naam}`, text, html };
}

// De ingevulde gegevens als leesbare tekst voor de mail- en WhatsApp-link; dezelfde opbouw
// als samenvatting() in contact.html.
export function samenvatting(a) {
  const regels = [
    ["Naam", a.Naam],
    ["E-mail", a["E-mail"]],
    ["Telefoon", a.Telefoon],
    ["Datum", a.Datum],
    ["Soort evenement", a["Soort evenement"]],
    ["Toelichting", a["Soort evenement (toelichting)"]],
    ["Pakket", a.Pakket],
    ["Locatie", a.Locatie],
  ]
    .filter((r) => r[1])
    .map((r) => `${r[0]}: ${r[1]}`);
  // Ingekort, zodat de mailto-link niet te lang wordt voor sommige mailprogramma's.
  // Zonder JavaScript stuurt de browser regeleinden als \r\n; hier altijd \n.
  let bericht = a.Bericht.replace(/\r\n?/g, "\n");
  if (bericht.length > 800) bericht = bericht.slice(0, 800) + " […]";
  if (bericht) regels.push("", bericht);
  return "Hoi PartyKlik,\n\nIk wil graag een offerte aanvragen.\n\n" + regels.join("\n");
}

// Gewone formulier-POST: de browser vraagt om een pagina. contact.html vraagt via fetch om JSON.
function wilPagina(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("text/html") && !accept.includes("application/json");
}

// Het vangnet van contact.html als losse pagina, voor bezoekers zonder JavaScript.
export function foutpagina(status, a, ongeldig) {
  // Inkorten kan een emoji halveren; encodeURIComponent weigert zo'n half teken.
  const tekst = samenvatting(a).toWellFormed();
  const mail =
    "mailto:info@partyklik.com?subject=" + encodeURIComponent("Offerteaanvraag via partyklik.nl") +
    "&body=" + encodeURIComponent(tekst.replace(/\n/g, "\r\n"));
  const whatsapp = "https://wa.me/31610643176?text=" + encodeURIComponent(tekst);
  const uitleg = ongeldig
    ? "Vul je naam en een geldig e-mailadres in en probeer het opnieuw. Of stuur je aanvraag met één klik via mail of WhatsApp: alles wat je hebt ingevuld staat er al in."
    : "Er ging iets mis bij het versturen, maar je gegevens zijn niet kwijt. Stuur ze met één klik via mail of WhatsApp: alles wat je hebt ingevuld staat er al in.";
  const terug = ongeldig
    ? "Of ga met de terugknop van je browser terug naar het formulier: wat je hebt ingevuld staat er dan nog."
    : `Of ga <a href="https://partyklik.nl/contact.html">terug naar het formulier</a> en probeer het over een paar minuten nog eens.`;
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Aanvraag niet verstuurd | PartyKlik</title>
<style>
body{margin:0;background:#faf8f4;color:#1b1720;font:16px/1.6 "Segoe UI",system-ui,sans-serif}
header{background:#191521;padding:1rem 1.25rem}
header a{color:#f5f1ea;font-weight:700;font-size:1.2rem;text-decoration:none}
header em{color:#b3801f;font-style:normal}
main{max-width:640px;margin:2.5rem auto;padding:0 1.25rem}
.kaart{background:#fff;border-radius:18px;padding:1.8rem 1.6rem;box-shadow:0 12px 40px -18px rgba(27,23,32,.35)}
h1{font-size:1.5rem;line-height:1.25;margin:0 0 .8rem}
.acties{display:flex;flex-wrap:wrap;gap:.7rem;margin:1.4rem 0}
.btn{display:inline-block;padding:.8rem 1.4rem;border-radius:999px;color:#fff;font-weight:700;text-decoration:none}
.mail{background:#1b1720}.wa{background:#1d7a46}
a{color:#8f6519}
.klein{color:#57505f;font-size:.95rem}
.klein a[href^="tel:"]{white-space:nowrap}
</style>
</head>
<body>
<header><a href="https://partyklik.nl/">Party<em>Klik</em></a></header>
<main>
<div class="kaart">
<h1>Je aanvraag is ${ongeldig ? "nog " : ""}niet verstuurd</h1>
<p>${uitleg}</p>
<p class="acties">
<a class="btn mail" href="${escapeHtml(mail)}">Mail je aanvraag</a>
<a class="btn wa" href="${escapeHtml(whatsapp)}" target="_blank" rel="noopener">Via WhatsApp</a>
</p>
<p class="klein">Opent er geen mailprogramma? Mail dan zelf naar <a href="mailto:info@partyklik.com">info@partyklik.com</a> of bel <a href="tel:+31610643176">+31 6 10 64 31 76</a>. ${terug}</p>
</div>
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      "X-Content-Type-Options": "nosniff",
      // Geen scripts, geen externe bronnen: alleen de inline opmaak hierboven.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
}

export default {
  async fetch(request, env) {
    const herkomst = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(herkomst) });
    if (request.method !== "POST") return antwoord(405, false, herkomst);
    // Alleen verzoeken vanaf de eigen site. Weert het gros van de spam die de URL oppikt.
    if (!TOEGESTANE_HERKOMST.includes(herkomst)) return antwoord(403, false, herkomst);

    // Zonder JavaScript post de browser het formulier zelf en verwacht hij een pagina terug.
    const pagina = wilPagina(request);
    const gelukt = () => (pagina ? Response.redirect(BEDANKT, 303) : antwoord(200, true, herkomst));
    const mislukt = (status, a, ongeldig) =>
      pagina ? foutpagina(status, a, ongeldig) : antwoord(status, false, herkomst);

    let form;
    try {
      form = await request.formData();
    } catch {
      return mislukt(400, schoonOp(new FormData()), true);
    }

    // Honeypot ingevuld: een bot. Doe alsof het gelukt is, maar verstuur niets.
    if ((form.get("_honey") || "").toString().trim()) return gelukt();

    const aanvraag = leesAanvraag(form);
    if (!aanvraag) return mislukt(400, schoonOp(form), true);
    if (!env.RESEND_API_KEY) return mislukt(500, aanvraag);

    const mail = maakMail(aanvraag);
    let res;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.FROM || STANDAARD_FROM,
          to: [env.TO || STANDAARD_TO],
          reply_to: aanvraag["E-mail"],
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
      });
    } catch (e) {
      console.log("Resend onbereikbaar:", e && e.message);
      return mislukt(502, aanvraag);
    }
    if (!res.ok) {
      console.log("Resend weigerde:", res.status, await res.text().catch(() => ""));
      return mislukt(502, aanvraag);
    }
    return gelukt();
  },
};
