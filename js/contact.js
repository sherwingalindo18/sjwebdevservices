/* ============================================================
   SJ WEBDEV SERVICES — contact.js
   Form validation + EmailJS delivery to sjwebdevservices@gmail.com

   ┌─────────────────────────────────────────────────────────┐
   │  EMAILJS SETUP (one-time, ~5 minutes) — see contact.html │
   │  bottom comment block for full step-by-step instructions │
   └─────────────────────────────────────────────────────────┘
   Fill in the three IDs below after creating your EmailJS account.
   ============================================================ */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     EMAILJS CREDENTIALS — replace these three values
  ----------------------------------------------------------- */
  var EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // EmailJS > Account > General > Public Key
  var EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // EmailJS > Email Services
  var EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // EmailJS > Email Templates
  /* --------------------------------------------------------- */

  var form = document.getElementById("contact-form");
  if (!form) return;

  var alertBox = form.querySelector(".form__alert");
  var submitBtn = form.querySelector('button[type="submit"]');
  var emailReady = EMAILJS_PUBLIC_KEY.indexOf("YOUR_") === -1;

  // initialise EmailJS SDK if present and configured
  if (emailReady && window.emailjs) {
    try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (e) {}
  }

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

    // ---------- EmailJS delivery ----------
    if (emailReady && window.emailjs) {
      var params = {
        from_name:  form.fullname.value,
        reply_to:   form.email.value,
        phone:      form.phone.value || "—",
        company:    form.company.value || "—",
        service:    form.service.value,
        budget:     form.budget.value || "Not specified",
        message:    form.message.value,
        to_email:   "sjwebdevservices@gmail.com"
      };
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
        .then(function () {
          form.reset();
          showAlert("success", "Thanks! Your message is on its way — we'll reply within one business day.");
        })
        .catch(function (err) {
          showAlert("error", "Something went wrong sending your message. Please email sjwebdevservices@gmail.com directly.");
          if (window.console) console.error("EmailJS error:", err);
        })
        .finally(function () {
          submitBtn.classList.remove("is-loading");
          submitBtn.removeAttribute("disabled");
        });
    } else {
      // ---------- Fallback (EmailJS not yet configured) ----------
      // Demo success so the UX is testable; also offers a mailto fallback.
      window.setTimeout(function () {
        submitBtn.classList.remove("is-loading");
        submitBtn.removeAttribute("disabled");
        form.reset();
        showAlert("success", "Form validated successfully. Add your EmailJS keys in js/contact.js to start receiving inquiries by email.");
      }, 900);
    }
  });
})();
