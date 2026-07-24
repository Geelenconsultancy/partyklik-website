// PartyKlik — navigatie, lightbox en kleine interacties
(function () {
  "use strict";

  // Mobiel menu
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Lightbox voor galerijfoto's
  var links = document.querySelectorAll(".gallery a[href$='.jpg']");
  if (links.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Fotoweergave");
    box.innerHTML =
      '<img alt=""><button type="button" aria-label="Sluiten">×</button>';
    document.body.appendChild(box);
    var img = box.querySelector("img");

    function close() {
      box.classList.remove("open");
      img.src = "";
    }

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        img.src = a.getAttribute("href");
        img.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
        box.classList.add("open");
      });
    });

    box.addEventListener("click", function (e) {
      if (e.target !== img) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }
})();
