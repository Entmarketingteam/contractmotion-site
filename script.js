/* ============================================================
   ContractMotion — script.js
   GA4 event tracking, heatmap-ready, mobile-optimized
   ============================================================ */

(function () {
  'use strict';

  /* ---- GA4 helper (fires gtag events if loaded, no-ops otherwise) ---- */
  function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

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
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
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

  /* ---- GA4: Track all CTA/button clicks via data-track attribute ---- */
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      var eventName = this.getAttribute('data-track');
      var label = this.getAttribute('data-label') || '';
      trackEvent(eventName, {
        event_category: 'engagement',
        event_label: label,
        button_text: this.textContent.trim().substring(0, 50)
      });
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

      // GA4: form submission event
      trackEvent('signal_audit_request', {
        event_category: 'conversion',
        company: company,
        role: role,
        region: region,
        revenue: revenue
      });

      var payload = { company: company, role: role, region: region, revenue: revenue };

      fetch('/api/signal-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .catch(function () {
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

      // GA4: newsletter subscription event
      trackEvent('newsletter_subscribe', {
        event_category: 'conversion',
        method: 'email'
      });

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
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.step-card, .service-card, .signal-card, .testimonial-card, .onboard-card, .fit-col, .guarantee-point, .proof-item'
    ).forEach(function (el) {
      el.classList.add('fade-in');
      fadeObserver.observe(el);
    });
  }

  /* ---- GA4: Section visibility tracking (for scroll depth / heatmap correlation) ---- */
  if ('IntersectionObserver' in window) {
    var sectionsSeen = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (id && !sectionsSeen[id]) {
            sectionsSeen[id] = true;
            trackEvent('section_view', {
              event_category: 'engagement',
              section_id: id
            });
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('section[id]').forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---- GA4: Scroll depth milestones ---- */
  var scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((scrollTop / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (milestone) {
      if (pct >= milestone && !scrollMilestones[milestone]) {
        scrollMilestones[milestone] = true;
        trackEvent('scroll_depth', {
          event_category: 'engagement',
          percent_scrolled: milestone
        });
      }
    });
  });

  /* ---- Mobile sticky CTA bar ---- */
  var mobileCta = document.getElementById('mobileCta');
  if (mobileCta) {
    var ctaSection = document.getElementById('cta');
    var heroSection = document.getElementById('hero');

    window.addEventListener('scroll', function () {
      // Show after scrolling past hero, hide when CTA section is visible
      var pastHero = window.scrollY > (heroSection ? heroSection.offsetHeight * 0.7 : 400);
      var nearCta = false;
      if (ctaSection) {
        var ctaRect = ctaSection.getBoundingClientRect();
        nearCta = ctaRect.top < window.innerHeight && ctaRect.bottom > 0;
      }
      if (pastHero && !nearCta) {
        mobileCta.classList.add('visible');
        mobileCta.setAttribute('aria-hidden', 'false');
      } else {
        mobileCta.classList.remove('visible');
        mobileCta.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ---- GA4: Time on page (fires at 30s, 60s, 120s) ---- */
  [30, 60, 120].forEach(function (seconds) {
    setTimeout(function () {
      trackEvent('time_on_page', {
        event_category: 'engagement',
        seconds_elapsed: seconds
      });
    }, seconds * 1000);
  });

})();
