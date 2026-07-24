// PartyKlik — navigatie, lightbox en kleine interacties
(function () {
  "use strict";

  // Intro "de foto wordt gemaakt" — klasse is pre-paint gezet door een inline
  // snippet in de <head> van elke pagina; hier de aftelling tonen, opruimen en de
  // sessie markeren.
  if (document.documentElement.classList.contains("intro-pending")) {
    try {
      sessionStorage.setItem("pk-intro", "1");
    } catch (e) {}

    // Photobooth-aftelling "3 · 2 · 1 · Lachen! 📸" in het zoeker-kader.
    // Alleen tonen als beweging is toegestaan; anders blijft het rustig.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var heroEl = document.querySelector(".hero, .page-hero");
      if (heroEl) {
        var cd = document.createElement("div");
        cd.className = "pk-countdown";
        cd.setAttribute("aria-hidden", "true");
        cd.innerHTML =
          '<span class="pk-cd-num pk-cd-3">3</span>' +
          '<span class="pk-cd-num pk-cd-2">2</span>' +
          '<span class="pk-cd-num pk-cd-1">1</span>' +
          '<span class="pk-cd-smile"><span class="pk-cd-emoji">📸</span>Lachen!</span>';
        heroEl.appendChild(cd);
        window.setTimeout(function () {
          cd.remove();
        }, 2900);
      }
    }

    window.setTimeout(function () {
      document.documentElement.classList.remove("intro-pending");
    }, 2900);
  }

  // Scroll-reveal: stappen komen gestaffeld in beeld
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".steps li"));
  if (
    revealItems.length &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    document.documentElement.classList.add("reveal-ready");
    var revealCheck = function () {
      var batch = 0;
      revealItems = revealItems.filter(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          window.setTimeout(function () {
            el.classList.add("in-view");
          }, 150 * batch++);
          return false;
        }
        return true;
      });
      if (!revealItems.length) {
        window.removeEventListener("scroll", revealCheck);
      }
    };
    window.addEventListener("scroll", revealCheck, { passive: true });
    revealCheck();
  }

  // Mobiel menu
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
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
      document.body.classList.remove("lightbox-open");
      img.src = "";
    }

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        img.src = a.getAttribute("href");
        img.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
        box.classList.add("open");
        document.body.classList.add("lightbox-open");
        box.querySelector("button").focus();
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
