/* ============================================================
   SJ WEBDEV SERVICES — main.js
   Core interactions shared across every page.
   Vanilla JS only. No dependencies.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     1. LOADER + page-ready entrance
  --------------------------------------------------------- */
  function hideLoader() {
    var loader = $("#loader");
    document.body.classList.add("is-ready");
    if (loader) {
      loader.classList.add("is-done");
      window.setTimeout(function () { loader.remove(); }, 700);
    }
  }
  window.addEventListener("load", function () {
    window.setTimeout(hideLoader, prefersReduced ? 0 : 450);
  });
  // safety fallback if load never fires
  window.setTimeout(hideLoader, 2600);

  /* ---------------------------------------------------------
     2. NAVIGATION — scroll state, mobile drawer, active link
  --------------------------------------------------------- */
  var nav = $(".nav");
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var toggle = $(".nav__toggle");
  var backdrop = $(".nav__backdrop");
  function closeMenu() { document.body.classList.remove("menu-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  function openMenu()  { document.body.classList.add("menu-open");    if (toggle) toggle.setAttribute("aria-expanded", "true"); }
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  $$(".nav__menu a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  // active link by current filename
  (function highlightActive() {
    var path = location.pathname.split("/").pop() || "index.html";
    $$(".nav__link").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var target = href.split("/").pop();
      if (target === path || (path === "index.html" && (target === "" || target === "index.html"))) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  })();

  /* ---------------------------------------------------------
     3. SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  var revealEls = $$("[data-reveal], [data-stagger], .reveal-text, .tl-item");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  /* ---------------------------------------------------------
     4. ANIMATED COUNTERS
  --------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var duration = 1600;
    var start = null;
    el.classList.add("is-counting");
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = target * eased;
      el.firstChild.nodeValue = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else { el.firstChild.nodeValue = decimals ? target.toFixed(decimals) : target.toLocaleString(); el.classList.remove("is-counting"); }
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window && !prefersReduced) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(function (c) {
        var t = c.getAttribute("data-count");
        c.firstChild.nodeValue = (t.indexOf(".") > -1 ? parseFloat(t).toFixed(1) : parseInt(t, 10).toLocaleString());
      });
    }
  }

  /* ---------------------------------------------------------
     5. TESTIMONIAL SLIDER
  --------------------------------------------------------- */
  (function testimonialSlider() {
    var slider = $(".tslider");
    if (!slider) return;
    var rail   = $(".tslider__rail", slider);
    var slides = $$(".tslide", slider);
    var prev   = $(".tslider__arrow--prev", slider);
    var next   = $(".tslider__arrow--next", slider);
    var dotsWrap = $(".tslider__dots", slider);
    var index = 0, timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "tdot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = $$(".tdot", dotsWrap);

    function go(i) {
      index = (i + slides.length) % slides.length;
      rail.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === index); });
      slides.forEach(function (s, si) { s.setAttribute("aria-hidden", si !== index); });
    }
    function nextSlide() { go(index + 1); }
    function restart() { if (timer) clearInterval(timer); if (!prefersReduced) timer = setInterval(nextSlide, 6000); }

    if (prev) prev.addEventListener("click", function () { go(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(index + 1); restart(); });

    // swipe
    var sx = 0;
    rail.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    rail.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) { dx < 0 ? go(index + 1) : go(index - 1); restart(); }
    }, { passive: true });

    slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    slider.addEventListener("mouseleave", restart);
    go(0); restart();
  })();

  /* ---------------------------------------------------------
     6. FAQ ACCORDION
  --------------------------------------------------------- */
  $$(".faq__item").forEach(function (item) {
    var q = $(".faq__q", item);
    var a = $(".faq__a", item);
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open);
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ---------------------------------------------------------
     7. BACK TO TOP
  --------------------------------------------------------- */
  var toTop = $(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 520);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------
     8. SMOOTH ANCHOR SCROLL (offset for sticky nav)
  --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------------------------------------------------------
     9. PAGE TRANSITION (wipe on internal navigation)
  --------------------------------------------------------- */
  (function pageTransitions() {
    if (prefersReduced) return;
    var internal = $$('a[href$=".html"]');
    internal.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var url = a.getAttribute("href");
        // ignore new tabs / external / same page
        if (a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey) return;
        var current = location.pathname.split("/").pop() || "index.html";
        if (url.split("/").pop() === current) return;
        e.preventDefault();
        document.body.classList.add("page-leaving");
        window.setTimeout(function () { window.location.href = url; }, 520);
      });
    });
  })();

  /* ---------------------------------------------------------
     10. DYNAMIC FOOTER YEAR
  --------------------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

})();
