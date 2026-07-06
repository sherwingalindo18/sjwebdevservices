/* ============================================================
   SJ WEBDEV SERVICES — main.js
   Vanilla JavaScript. No frameworks, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Theme toggle (initial theme is set inline in <head> to avoid FOUC) ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("sj-theme", theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F3F4F8" : "#0A0C11");
    if (toggle) {
      toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(next);
    });
    setTheme(root.getAttribute("data-theme") || "dark");
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          ro.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduced || !target) { el.textContent = target; return; }
    var dur = 1400, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- Portfolio filters ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var works = document.querySelectorAll(".work");
  if (filterBtns.length && works.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        var f = btn.getAttribute("data-filter");
        works.forEach(function (w) {
          var show = f === "all" || w.getAttribute("data-cat") === f;
          w.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* ---------- Contact form (direct submit via FormSubmit — no email app) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var ENDPOINT = "https://formsubmit.co/ajax/sjwebdevservices@gmail.com";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var submitBtn = form.querySelector('button[type="submit"]');
      var get = function (id) { return (document.getElementById(id) || {}).value || ""; };

      var name = get("cf-name").trim();
      var email = get("cf-email").trim();
      var message = get("cf-message").trim();
      if (!name || !email || !message) {
        if (status) status.textContent = "/ please fill in your name, email and message.";
        return;
      }

      /* honeypot — silently drop bot submissions */
      var honey = document.getElementById("cf-honey");
      if (honey && honey.value) return;

      var company = get("cf-company").trim();
      var payload = {
        name: name,
        email: email,
        phone: get("cf-phone").trim() || "—",
        company: company || "—",
        service: get("cf-service") || "—",
        budget: get("cf-budget") || "—",
        message: message,
        _subject: "Project enquiry — " + name + (company ? " (" + company + ")" : ""),
        _bcc: "sherwingalindo18@gmail.com",
        _template: "table",
        _captcha: "false"
      };

      if (status) status.textContent = "/ sending your message…";
      if (submitBtn) submitBtn.disabled = true;

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function () {
          if (status) status.textContent = "/ message sent — we'll reply within one business day. thank you!";
          form.reset();
        })
        .catch(function () {
          if (status) status.textContent = "/ couldn't send right now — please email us directly at sjwebdevservices@gmail.com";
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
