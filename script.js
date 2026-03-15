/* ============================================================
   ContractMotion — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- Queue timestamp ---- */
  function updateQueueTime() {
    var el = document.getElementById('queueTime');
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }) + ' ET';
  }
  updateQueueTime();
  setInterval(updateQueueTime, 1000);

  /* ---- Nav scroll effect ---- */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(13, 17, 23, 0.98)';
    } else {
      nav.style.background = 'rgba(13, 17, 23, 0.9)';
    }
  });

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Smooth scroll offset for fixed nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var navHeight = 64;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- Signal Audit form ---- */
  var auditForm = document.getElementById('auditForm');
  var formSuccess = document.getElementById('formSuccess');
  var formError = document.getElementById('formError');
  var ctaNote = document.getElementById('ctaNote');

  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formError.textContent = '';

      var company = auditForm.querySelector('#company').value.trim();
      var role = auditForm.querySelector('#role').value;
      var region = auditForm.querySelector('#region').value;
      var revenue = auditForm.querySelector('#revenue').value;

      if (!company) { formError.textContent = 'Company name is required.'; return; }
      if (!role) { formError.textContent = 'Please select your role.'; return; }
      if (!region) { formError.textContent = 'Please select your target market region.'; return; }
      if (!revenue) { formError.textContent = 'Please select your revenue range.'; return; }

      var btn = auditForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      var payload = { company: company, role: role, region: region, revenue: revenue };

      fetch('/api/signal-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .catch(function () {
          // Endpoint not live — still show success in placeholder mode
          return { ok: true };
        })
        .then(function () {
          auditForm.style.display = 'none';
          if (ctaNote) ctaNote.style.display = 'none';
          formSuccess.style.display = 'block';
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
  }

  /* ---- Subscribe form ---- */
  var subscribeForm = document.getElementById('subscribeForm');
  var subSuccess = document.getElementById('subSuccess');
  var subError = document.getElementById('subError');
  var subNote = document.getElementById('subNote');

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      subError.textContent = '';

      var email = subscribeForm.querySelector('#subEmail').value.trim();
      if (!email || !isValidEmail(email)) {
        subError.textContent = 'A valid email address is required.';
        return;
      }

      var btn = subscribeForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Subscribing...';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
        .catch(function () {
          return { ok: true };
        })
        .then(function () {
          subscribeForm.style.display = 'none';
          if (subNote) subNote.style.display = 'none';
          subSuccess.style.display = 'flex';
        });
    });
  }

  /* ---- Utility ---- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ---- Intersection observer for fade-in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.step-card, .service-card, .signal-card, .testimonial-card, .onboard-card, .fit-col, .guarantee-point, .proof-item'
    ).forEach(function (el) {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }
})();
