/* ============================================================
   SJ WEBDEV SERVICES — contact.js
   Form validation + Formspree delivery to sjwebdevservices@gmail.com

   ┌─────────────────────────────────────────────────────────┐
   │  FORMSPREE SETUP (one-time, ~3 minutes) — see contact.html │
   │  bottom comment block for full step-by-step instructions  │
   └─────────────────────────────────────────────────────────┘
   Paste your Formspree form ID below after creating your form.
   ============================================================ */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     FORMSPREE FORM ID — replace this one value
     Create a free form at https://formspree.io that delivers to
     sjwebdevservices@gmail.com, then paste its ID here. The ID is
     the last part of the form's endpoint:
        https://formspree.io/f/XXXXXXXX   ->   "XXXXXXXX"
  ----------------------------------------------------------- */
  var FORMSPREE_FORM_ID = "YOUR_FORM_ID";
  /* --------------------------------------------------------- */

  var form = document.getElementById("contact-form");
  if (!form) return;

  var alertBox = form.querySelector(".form__alert");
  var submitBtn = form.querySelector('button[type="submit"]');
  var formReady = FORMSPREE_FORM_ID.indexOf("YOUR_") === -1 && FORMSPREE_FORM_ID.trim() !== "";
  var endpoint = "https://formspree.io/f/" + FORMSPREE_FORM_ID;

  /* ---------- Validation rules ---------- */
  var rules = {
    fullname: { required: true,  test: function (v) { return v.trim().length >= 2; }, msg: "Please enter your full name." },
    email:    { required: true,  test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, msg: "Enter a valid email address." },
    phone:    { required: false, test: function (v) { return v.trim() === "" || /^[\d\s()+\-]{6,}$/.test(v.trim()); }, msg: "Enter a valid phone number." },
    company:  { required: false, test: function () { return true; } },
    service:  { required: true,  test: function (v) { return v.trim() !== ""; }, msg: "Please choose a service." },
    budget:   { required: false, test: function () { return true; } },
    message:  { required: true,  test: function (v) { return v.trim().length >= 10; }, msg: "Tell us a little about your project (10+ characters)." }
  };

  function fieldWrap(input) { return input.closest(".field"); }
  function setError(input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add("has-error");
    var err = wrap.querySelector(".field__err");
    if (err) err.textContent = message;
  }
  function clearError(input) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.remove("has-error");
    var err = wrap.querySelector(".field__err");
    if (err) err.textContent = "";
  }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var val = input.value;
    if (rule.required && val.trim() === "") { setError(input, "This field is required."); return false; }
    if (!rule.test(val)) { setError(input, rule.msg || "Please check this field."); return false; }
    clearError(input);
    return true;
  }

  // live clearing as the user types
  Array.prototype.forEach.call(form.elements, function (el) {
    if (!el.name) return;
    el.addEventListener("blur", function () { validateField(el); });
    el.addEventListener("input", function () { if (fieldWrap(el) && fieldWrap(el).classList.contains("has-error")) validateField(el); });
  });

  function showAlert(type, text) {
    if (!alertBox) return;
    alertBox.className = "form__alert show " + type;
    alertBox.textContent = text;
    alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function hideAlert() { if (alertBox) alertBox.className = "form__alert"; }

  function resetButton() {
    submitBtn.classList.remove("is-loading");
    submitBtn.removeAttribute("disabled");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideAlert();

    // validate all
    var firstInvalid = null, ok = true;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || !rules[el.name]) return;
      if (!validateField(el)) { ok = false; if (!firstInvalid) firstInvalid = el; }
    });
    if (!ok) {
      if (firstInvalid) firstInvalid.focus();
      showAlert("error", "Please fix the highlighted fields and try again.");
      return;
    }

    submitBtn.classList.add("is-loading");
    submitBtn.setAttribute("disabled", "disabled");

    // ---------- Formspree delivery ----------
    if (formReady && window.fetch) {
      var data = new FormData(form);
      // A readable subject line in the inbox; Formspree uses the "email"
      // field as the reply-to automatically.
      data.append("_subject", "New website inquiry from " + (form.fullname.value || "your site"));

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showAlert("success", "Thanks! Your message is on its way — we'll reply within one business day.");
          } else {
            return res.json().then(function (d) {
              var m = (d && d.errors && d.errors.length) ? d.errors[0].message : null;
              showAlert("error", m || "Something went wrong sending your message. Please email sjwebdevservices@gmail.com directly.");
            }).catch(function () {
              showAlert("error", "Something went wrong sending your message. Please email sjwebdevservices@gmail.com directly.");
            });
          }
        })
        .catch(function (err) {
          showAlert("error", "Network error sending your message. Please email sjwebdevservices@gmail.com directly.");
          if (window.console) console.error("Formspree error:", err);
        })
        .finally(resetButton);
    } else {
      // ---------- Fallback (Formspree not yet configured) ----------
      // Demo success so the UX is testable until the form ID is added.
      window.setTimeout(function () {
        resetButton();
        form.reset();
        showAlert("success", "Form validated successfully. Add your Formspree form ID in js/contact.js to start receiving inquiries by email.");
      }, 900);
    }
  });
})();
