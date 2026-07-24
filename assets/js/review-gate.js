// PartyKlik — tijdelijk beoordelingsscherm (preview voor Arjan).
// VERWIJDEREN BIJ PUBLIEKE LANCERING: haal de <script src="assets/js/review-gate.js">
// uit de <head> van alle pagina's en zet robots.txt terug op "Allow: /".
// Let op: dit is een drempel, geen echte beveiliging — de code staat in de broncode.
(function () {
  "use strict";
  var CODE = "8847";
  try {
    // Directe toegang via link, bijv. https://partyklik.nl/?preview=8847
    if (new URLSearchParams(location.search).get("preview") === CODE) {
      localStorage.setItem("pk-review", CODE);
    }
    if (localStorage.getItem("pk-review") === CODE) return;
  } catch (e) {}

  document.documentElement.classList.add("review-gated");

  document.addEventListener("DOMContentLoaded", function () {
    var gate = document.createElement("div");
    gate.className = "review-gate";
    gate.innerHTML =
      '<form class="review-gate-card">' +
      '<p class="review-gate-kicker">Preview</p>' +
      "<h1>Party<em>Klik</em></h1>" +
      "<p>Deze site is nog niet openbaar. Vul de code in om de preview te bekijken.</p>" +
      '<label class="sr-only" for="review-code">Toegangscode</label>' +
      '<input id="review-code" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="Toegangscode" required>' +
      '<button class="btn btn-primary" type="submit">Bekijk de site</button>' +
      '<p class="review-gate-error" hidden>Die code klopt niet — probeer het nog eens.</p>' +
      "</form>";
    document.body.appendChild(gate);

    var input = gate.querySelector("input");
    var error = gate.querySelector(".review-gate-error");
    input.focus();

    gate.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (input.value.trim() === CODE) {
        try {
          localStorage.setItem("pk-review", CODE);
        } catch (err) {}
        document.documentElement.classList.remove("review-gated");
        gate.remove();
      } else {
        error.hidden = false;
        input.value = "";
        input.focus();
      }
    });
  });
})();
