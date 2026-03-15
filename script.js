/* ============================================================
   ContractMotion — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- Queue timestamp ---- */
  function updateQueueTime() {
    const el = document.getElementById('queueTime');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }) + ' ET';
  }
  updateQueueTime();
  setInterval(updateQueueTime, 1000);

  /* ---- Nav scroll effect ---- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(13, 17, 23, 0.98)';
    } else {
      nav.style.background = 'rgba(13, 17, 23, 0.9)';
    }
  });

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
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
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- Signal Audit form ---- */
  const auditForm = document.getElementById('auditForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  const ctaNote = document.getElementById('ctaNote');

  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formError.textContent = '';

      const company = auditForm.querySelector('#company').value.trim();
      const role = auditForm.querySelector('#role').value;
      const regionEl = auditForm.querySelector('#region') || auditForm.querySelector('#sector') || auditForm.querySelector('#project-type') || auditForm.querySelector('#facility-type') || auditForm.querySelector('#specialty');
      const region = regionEl ? regionEl.value : 'n/a';
      const revenue = auditForm.querySelector('#revenue').value;

      if (!company) { formError.textContent = 'Company name is required.'; return; }
      if (!role) { formError.textContent = 'Please select your role.'; return; }
      if (regionEl && !region) { formError.textContent = 'Please select an option.'; return; }
      if (!revenue) { formError.textContent = 'Please select your revenue range.'; return; }

      const btn = auditForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      const payload = { company, role, region, revenue };

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
  const subscribeForm = document.getElementById('subscribeForm');
  const subSuccess = document.getElementById('subSuccess');
  const subError = document.getElementById('subError');
  const subNote = document.getElementById('subNote');

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      subError.textContent = '';

      const email = subscribeForm.querySelector('#subEmail').value.trim();
      if (!email || !isValidEmail(email)) {
        subError.textContent = 'A valid email address is required.';
        return;
      }

      const btn = subscribeForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Subscribing...';

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.step-card, .metric-card, .signal-card, .timeline-item, .fit-col, .sector-card, .industry-card'
    ).forEach(function (el) {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }
})();
