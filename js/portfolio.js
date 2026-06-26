/* ============================================================
   SJ WEBDEV SERVICES — portfolio.js
   Category filtering + lightbox preview
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

  /* ---------- Lightbox ---------- */
  var lb       = $(".lightbox");
  if (!lb) return;
  var lbImg    = $(".lightbox__media img", lb);
  var lbTitle  = $(".lightbox__title", lb);
  var lbCat    = $(".lightbox__cat", lb);
  var lbDesc   = $(".lightbox__desc", lb);
  var lbType   = $(".lightbox__type", lb);
  var lbStack  = $(".lightbox__stack", lb);
  var lbLink   = $(".lightbox__link", lb);
  var lbClose  = $(".lightbox__close", lb);
  var lastFocus = null;

  function openLightbox(card) {
    var img  = $(".p-card__media img", card);
    lastFocus = document.activeElement;
    lbImg.src = img ? img.getAttribute("src") : "";
    lbImg.alt = img ? img.getAttribute("alt") : "";
    lbTitle.textContent = card.getAttribute("data-title") || "";
    lbCat.textContent   = "/" + (card.getAttribute("data-cat-label") || card.getAttribute("data-category") || "");
    lbDesc.textContent  = card.getAttribute("data-desc") || "";
    lbType.textContent  = card.getAttribute("data-type") || "Website";
    lbStack.textContent = card.getAttribute("data-stack") || "HTML · CSS · JavaScript";
    var url = card.getAttribute("data-url") || "#";
    lbLink.setAttribute("href", url);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  cards.forEach(function (card) {
    var trigger = $(".p-card__zoom", card);
    var media   = $(".p-card__media", card);
    function handle(e) { e.preventDefault(); openLightbox(card); }
    if (trigger) trigger.addEventListener("click", handle);
    if (media)   media.addEventListener("click", handle);
  });

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox(); });

})();
