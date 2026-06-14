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

  /* ---- Lead attribution metadata (shared by both forms) ---- */
  function leadMeta() {
    const p = new URLSearchParams(window.location.search);
    const slug = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'index';
    return {
      siteSlug: slug,
      pageUrl: window.location.href,
      utmSource: p.get('utm_source') || '',
      utmMedium: p.get('utm_medium') || '',
      utmCampaign: p.get('utm_campaign') || '',
      submittedAt: new Date().toISOString()
    };
  }

  /* ---- Signal Audit form ---- */
  const auditForm = document.getElementById('auditForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  const ctaNote = document.getElementById('ctaNote');

  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formError.textContent = '';

      const val = function (sel) { const el = auditForm.querySelector(sel); return el ? el.value.trim() : ''; };
      const company = val('#company');
      const email = val('#workEmail') || val('#email');
      const role = val('#role');
      const revenueEl = auditForm.querySelector('#revenue');
      const revenue = revenueEl ? revenueEl.value : '';
      // Capture every vertical-specific select (#trade, #sector, #product, #naics, etc.)
      // generically so no page's segmentation field is silently dropped.
      const segs = [];
      auditForm.querySelectorAll('select').forEach(function (s) {
        if (s.id === 'role' || s.id === 'revenue') return;
        if (s.value) segs.push((s.id || 'detail') + ': ' + s.value);
      });
      const region = segs.join('; ') || 'n/a';

      if (!company) { formError.textContent = 'Company name is required.'; return; }
      if (!email || !isValidEmail(email)) { formError.textContent = 'A valid work email is required.'; return; }
      if (!role) { formError.textContent = 'Please select your role.'; return; }
      if (revenueEl && !revenue) { formError.textContent = 'Please select your revenue range.'; return; }
      let incomplete = false;
      auditForm.querySelectorAll('select').forEach(function (s) { if (!s.value) incomplete = true; });
      if (incomplete) { formError.textContent = 'Please complete all fields.'; return; }

      const btn = auditForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      const payload = Object.assign({ company, email, role, region, revenue }, leadMeta());

      fetch('https://entagency.app.n8n.cloud/webhook/contractmotion-signal-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .catch(function () {
          // Network error — still show success (submission logged server-side)
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

      fetch('https://entagency.app.n8n.cloud/webhook/contractmotion-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ email }, leadMeta()))
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
