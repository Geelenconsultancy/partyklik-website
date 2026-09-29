// PartyKlik — offerteformulier-verzender (Cloudflare Worker).
//
// Ontvangt het formulier van partyklik.nl/contact.html en mailt de aanvraag via Resend
// naar info@partyklik.com, met de aanvrager als Reply-To. Antwoordt met
// {"success":true} of {"success":false}; contact.html toont bij false het vangnet.
//
// Instellingen (Cloudflare → Worker → Settings → Variables and Secrets):
//   RESEND_API_KEY  verplicht, als Secret. Nooit in deze (publieke) repo zetten.
//   TO              optioneel; standaard info@partyklik.com. Handig om eerst naar
//                   je eigen adres te testen.
//   FROM            optioneel; standaard "PartyKlik website <formulier@partyklik.nl>".
//
// De ontvanger staat vast in de Worker en komt nooit uit het formulier, zodat niemand
// deze Worker kan misbruiken om naar andere adressen te mailen.

const STANDAARD_TO = "info@partyklik.com";
const STANDAARD_FROM = "PartyKlik website <formulier@partyklik.nl>";
const TOEGESTANE_HERKOMST = ["https://partyklik.nl", "https://www.partyklik.nl"];

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

// Leest en schoont de velden op. Geeft null terug als de verplichte velden niet kloppen.
export function leesAanvraag(form) {
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
  if (!a.Naam || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a["E-mail"])) return null;
  return a;
}

export function maakMail(a) {
  const regels = VELDEN.filter((v) => a[v]);
  const text =
    "Nieuwe offerteaanvraag via partyklik.nl\n\n" +
    regels.map((v) => (v === "Bericht" ? `\n${v}:\n${a[v]}` : `${v}: ${a[v]}`)).join("\n") +
    "\n\nBeantwoorden gaat rechtstreeks naar de aanvrager.";
  const rijen = regels
    .map(
      (v) =>
        `<tr><th style="text-align:left;vertical-align:top;padding:6px 12px 6px 0;white-space:nowrap">${escapeHtml(v)}</th>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(a[v])}</td></tr>`
    )
    .join("");
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1b1720">` +
    `<p><strong>Nieuwe offerteaanvraag via partyklik.nl</strong></p>` +
    `<table style="border-collapse:collapse">${rijen}</table>` +
    `<p style="color:#57505f;font-size:13px">Beantwoorden gaat rechtstreeks naar de aanvrager.</p></div>`;
  return { subject: `Nieuwe offerteaanvraag via partyklik.nl — ${a.Naam}`, text, html };
}

export default {
  async fetch(request, env) {
    const herkomst = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(herkomst) });
    if (request.method !== "POST") return antwoord(405, false, herkomst);
    // Alleen verzoeken vanaf de eigen site. Weert het gros van de spam die de URL oppikt.
    if (!TOEGESTANE_HERKOMST.includes(herkomst)) return antwoord(403, false, herkomst);

    let form;
    try {
      form = await request.formData();
    } catch {
      return antwoord(400, false, herkomst);
    }

    // Honeypot ingevuld: een bot. Doe alsof het gelukt is, maar verstuur niets.
    if ((form.get("_honey") || "").toString().trim()) return antwoord(200, true, herkomst);

    const aanvraag = leesAanvraag(form);
    if (!aanvraag) return antwoord(400, false, herkomst);
    if (!env.RESEND_API_KEY) return antwoord(500, false, herkomst);

    const mail = maakMail(aanvraag);
    try {
      const res = await fetch("https://api.resend.com/emails", {
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
      if (!res.ok) {
        console.log("Resend weigerde:", res.status, await res.text());
        return antwoord(502, false, herkomst);
      }
    } catch (e) {
      console.log("Resend onbereikbaar:", e && e.message);
      return antwoord(502, false, herkomst);
    }
    return antwoord(200, true, herkomst);
  },
};
