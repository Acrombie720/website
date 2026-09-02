/* ==========================================================================
   FluencyFox - cookie consent banner
   Matches Privacy Policy Section 8: essential / analytics / marketing
   cookies, with Accept all / Reject non-essential / Customise, and a
   "Cookie Settings" link in the footer to reopen preferences at any time.
   ========================================================================== */

(function () {
  var STORAGE_KEY = 'ffCookieConsent';

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    consent.essential = true;
    consent.date = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) { /* ignore - private browsing etc */ }
    applyConsent(consent);
  }

  // Hook point: wire real analytics/marketing scripts here, gated on
  // consent, once the analytics/marketing stack is chosen. Nothing is
  // loaded today, so these branches are currently no-ops.
  function applyConsent(consent) {
    if (consent.analytics) {
      // e.g. load analytics here
    }
    if (consent.marketing) {
      // e.g. load marketing/ad pixels here
    }
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'cookie-consent';
    wrap.innerHTML =
      '<div class="cookie-banner" id="cookieBanner" role="dialog" aria-live="polite" aria-label="Cookie preferences">' +
        '<p>We use essential cookies to run this site, and optional analytics/marketing cookies to understand traffic and improve it. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-outline" id="cookieCustomize">Customise</button>' +
          '<button type="button" class="btn btn-outline" id="cookieReject">Reject Non-Essential</button>' +
          '<button type="button" class="btn btn-primary" id="cookieAcceptAll">Accept All</button>' +
        '</div>' +
      '</div>' +
      '<div class="cookie-modal-overlay" id="cookieModalOverlay">' +
        '<div class="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie settings">' +
          '<h3>Cookie settings</h3>' +
          '<div class="cookie-row">' +
            '<div><strong>Essential</strong><p>Required for the site to function. Cannot be switched off.</p></div>' +
            '<label class="cookie-toggle disabled"><input type="checkbox" checked disabled><span></span></label>' +
          '</div>' +
          '<div class="cookie-row">' +
            '<div><strong>Analytics</strong><p>Helps us understand how visitors use the site so we can improve it.</p></div>' +
            '<label class="cookie-toggle"><input type="checkbox" id="cookieAnalytics"><span></span></label>' +
          '</div>' +
          '<div class="cookie-row">' +
            '<div><strong>Marketing</strong><p>Used to deliver relevant ads and measure campaign performance.</p></div>' +
            '<label class="cookie-toggle"><input type="checkbox" id="cookieMarketing"><span></span></label>' +
          '</div>' +
          '<div class="cookie-modal-actions">' +
            '<button type="button" class="btn btn-outline" id="cookieSavePrefs">Save Preferences</button>' +
            '<button type="button" class="btn btn-primary" id="cookieModalAcceptAll">Accept All</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function showBanner(el) { el.querySelector('#cookieBanner').classList.add('open'); }
  function hideBanner(el) { el.querySelector('#cookieBanner').classList.remove('open'); }
  function showModal(el) { el.querySelector('#cookieModalOverlay').classList.add('open'); }
  function hideModal(el) { el.querySelector('#cookieModalOverlay').classList.remove('open'); }

  function init() {
    var el = build();
    var existing = getConsent();

    if (!existing) {
      showBanner(el);
    }

    el.querySelector('#cookieAcceptAll').addEventListener('click', function () {
      saveConsent({ analytics: true, marketing: true });
      hideBanner(el);
    });
    el.querySelector('#cookieReject').addEventListener('click', function () {
      saveConsent({ analytics: false, marketing: false });
      hideBanner(el);
    });
    el.querySelector('#cookieCustomize').addEventListener('click', function () {
      openPreferences(el);
    });
    el.querySelector('#cookieModalAcceptAll').addEventListener('click', function () {
      saveConsent({ analytics: true, marketing: true });
      hideModal(el);
      hideBanner(el);
    });
    el.querySelector('#cookieSavePrefs').addEventListener('click', function () {
      saveConsent({
        analytics: el.querySelector('#cookieAnalytics').checked,
        marketing: el.querySelector('#cookieMarketing').checked
      });
      hideModal(el);
      hideBanner(el);
    });
    el.querySelector('#cookieModalOverlay').addEventListener('click', function (e) {
      if (e.target === this) hideModal(el);
    });

    function openPreferences(el) {
      var consent = getConsent() || { analytics: false, marketing: false };
      el.querySelector('#cookieAnalytics').checked = !!consent.analytics;
      el.querySelector('#cookieMarketing').checked = !!consent.marketing;
      showModal(el);
    }

    // Footer "Cookie Settings" link reopens preferences at any time.
    document.querySelectorAll('#cookieSettingsLink').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openPreferences(el);
      });
    });

    if (existing) applyConsent(existing);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
