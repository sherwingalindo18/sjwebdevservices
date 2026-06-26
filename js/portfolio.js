/* ============================================================
   SJ WEBDEV SERVICES — portfolio.js
   Category filtering + open each project's live business website
   ============================================================ */
(function () {
  "use strict";
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var grid = $(".portfolio-grid");
  if (!grid) return;
  var cards = $$(".p-card", grid);

  /* ---------- Filtering ---------- */
  var filters = $$(".filter");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (f) { f.classList.remove("is-active"); f.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-category") === cat;
        if (match) {
          card.classList.remove("is-hidden");
          if (!prefersReduced) {
            card.style.opacity = "0";
            card.style.transform = "translateY(14px)";
            requestAnimationFrame(function () {
              card.style.transition = "opacity .5s var(--ease), transform .5s var(--ease)";
              card.style.opacity = "1";
              card.style.transform = "none";
            });
          }
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  /* ---------- Open the live business website ---------- */
  // Clicking a project's image (or the icon button on it) opens that
  // business's actual website in a new tab — no image lightbox.
  var EXTERNAL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 4h6v6"/><path d="M20 4 11 13"/>' +
    '<path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

  function visit(url) {
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener");
  }

  cards.forEach(function (card) {
    var url     = card.getAttribute("data-url") || "#";
    var title   = card.getAttribute("data-title") || "this project";
    var media   = $(".p-card__media", card);
    var trigger = $(".p-card__zoom", card);

    function handle(e) { e.preventDefault(); visit(url); }

    if (media) {
      media.addEventListener("click", handle);
      media.style.cursor = "pointer";
    }
    if (trigger) {
      // Repurpose the on-image button: signal "opens website" and label it.
      trigger.innerHTML = EXTERNAL_ICON;
      trigger.setAttribute("aria-label", "Visit " + title + " website");
      trigger.addEventListener("click", function (e) { e.stopPropagation(); handle(e); });
    }
  });

})();
