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

  /* ---- Leadbird Exit Intent & Delay Popup ---- */
  function initExitPopup() {
    // If popup was already closed or submitted in this session or localStorage, don't show it
    if (localStorage.getItem('cm_exit_popup_closed') === 'true') return;

    // Do not show on the privacy policy or success states
    if (window.location.pathname.indexOf('privacy') !== -1) return;

    // Inject styles dynamically if not already present
    if (!document.getElementById('exit-popup-styles')) {
      const style = document.createElement('style');
      style.id = 'exit-popup-styles';
      style.textContent = `
        .exit-overlay {
          position: fixed; inset: 0; background: rgba(13, 17, 23, 0.95); backdrop-filter: blur(8px);
          z-index: 10000; display: none; align-items: center; justify-content: center; padding: 20px;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .exit-overlay.is-open { display: flex; opacity: 1; }
        .exit-card {
          background: #161B22; border: 2px solid #00FF94; border-radius: 12px; max-width: 520px; width: 100%;
          padding: 36px; box-shadow: 0 25px 70px rgba(0,0,0,0.9), 0 0 30px rgba(0, 255, 148, 0.15);
          position: relative; transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .exit-overlay.is-open .exit-card { transform: scale(1); }
        .exit-close {
          position: absolute; top: 12px; right: 16px; background: transparent; border: none;
          color: #8B949E; font-size: 28px; cursor: pointer; transition: color 0.2s; line-height: 1;
        }
        .exit-close:hover { color: #FF3366; }
        .exit-title { font-family: 'JetBrains Mono', monospace; color: #FFF; font-size: 22px; font-weight: 800; margin-bottom: 12px; line-height: 1.3; }
        .exit-desc { color: #8B949E; font-size: 14.5px; line-height: 1.5; margin-bottom: 20px; }
        .exit-bullets { margin-bottom: 24px; list-style: none; padding: 0; }
        .exit-bullets li { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; color: #00FF94; margin-bottom: 8px; padding-left: 18px; position: relative; }
        .exit-bullets li::before { content: '✓'; position: absolute; left: 0; color: #00FF94; font-weight: bold; }
        .exit-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; text-align: left; }
        .exit-form-group label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8B949E; text-transform: uppercase; letter-spacing: 0.05em; }
        .exit-form-input { background: #1C2128; border: 1px solid #30363D; border-radius: 6px; padding: 12px 14px; color: #FFF; font-size: 14px; transition: border-color 0.2s; }
        .exit-form-input:focus { outline: none; border-color: #00FF94; }
        .exit-submit-btn { width: 100%; background: #00FF94; color: #0D1117; border: none; border-radius: 6px; padding: 14px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.1s, background-color 0.2s; }
        .exit-submit-btn:hover { transform: translateY(-1px); background: #00e682; }
        .exit-success-block { text-align: center; padding: 20px 0; }
        .exit-success-icon { font-size: 48px; color: #00FF94; margin-bottom: 16px; }
      `;
      document.head.appendChild(style);
    }

    // Create and append the markup
    const overlay = document.createElement('div');
    overlay.className = 'exit-overlay';
    overlay.id = 'exit-popup';
    overlay.innerHTML = `
      <div class="exit-card">
        <button class="exit-close" id="exit-close-btn">&times;</button>
        <div id="exit-popup-content">
          <h3 class="exit-title">What if you didn't pay until we actually got you a lead?</h3>
          <p class="exit-desc">We'll build and launch your outbound campaigns for free. You only pay when we deliver your first qualified lead.</p>
          <ul class="exit-bullets">
            <li>No setup fees</li>
            <li>No contracts</li>
            <li>No risk</li>
          </ul>
          <form id="exit-form-el" novalidate>
            <div class="exit-form-group">
              <label for="exit-email">Work Email</label>
              <input type="email" class="exit-form-input" id="exit-email" placeholder="you@company.com" required />
            </div>
            <div class="exit-form-group" id="exit-metro-group">
              <label for="exit-metro">Your Target Market / Region</label>
              <input type="text" class="exit-form-input" id="exit-metro" placeholder="e.g. Dallas, TX or All US" required />
            </div>
            <button type="submit" class="exit-submit-btn">Start My Free Campaign &rarr;</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let popupShown = false;

    function showPopup() {
      if (popupShown) return;
      if (localStorage.getItem('cm_exit_popup_closed') === 'true') return;
      popupShown = true;
      overlay.style.display = 'flex';
      // force reflow
      void overlay.offsetWidth;
      overlay.classList.add('is-open');
    }

    function closePopup() {
      overlay.classList.remove('is-open');
      localStorage.setItem('cm_exit_popup_closed', 'true');
      setTimeout(function () {
        overlay.style.display = 'none';
      }, 300);
    }

    document.getElementById('exit-close-btn').addEventListener('click', closePopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });

    // Detect exit intent
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 20) {
        showPopup();
      }
    });

    // Trigger after 20 seconds delay
    setTimeout(showPopup, 20000);

    // Form submission
    const form = document.getElementById('exit-form-el');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('exit-email').value.trim();
      const metro = document.getElementById('exit-metro').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!email || !isValidEmail(email)) {
        alert('Please enter a valid work email.');
        return;
      }
      if (!metro) {
        alert('Please enter your target market.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Reuse lead attribution metadata
      const payload = Object.assign({
        email: email,
        metro: metro,
        source: 'exit-intent-popup',
      }, leadMeta());

      try {
        const r = await fetch('https://entagency.app.n8n.cloud/webhook/cm-direct-response-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error();

        document.getElementById('exit-popup-content').innerHTML = `
          <div class="exit-success-block">
            <div class="exit-success-icon">✓</div>
            <h3 class="exit-title">You're on the list!</h3>
            <p class="exit-desc">We are analyzing <strong>` + metro + `</strong>. We will reach out to build and launch your free campaign within 24 hours.</p>
          </div>
        `;
        localStorage.setItem('cm_exit_popup_closed', 'true');
        setTimeout(closePopup, 3000);
      } catch (err) {
        // Mailto fallback
        const subject = encodeURIComponent('Start My Free Campaign');
        const body = encodeURIComponent('Hey Ethan,\n\nI want to start my free campaign! No setup fees, no contracts, no risk. I\'m a commercial operator in ' + metro + ' (' + email + '). Let\'s build and launch our outbound campaigns for free.\n\nTalk soon!');
        window.location.href = 'mailto:ethan@contractmotion.com?subject=' + subject + '&body=' + body;
        closePopup();
      }
    });
  }

  // Run popup initialization on window load
  window.addEventListener('load', function () {
    setTimeout(initExitPopup, 1000);
  });
})();
