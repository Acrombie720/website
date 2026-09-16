/* ==========================================================================
   FluencyFox - cookie consent banner
   Matches Privacy Policy Section 8: essential / analytics / marketing
   cookies, with Accept all / Reject non-essential / Customise.

   Note: class/id names deliberately avoid generic terms like
   "cookie-banner" / "cookie-consent" / "#cookieBanner" - several common
   ad-blocker cosmetic filter lists (e.g. EasyList Cookie) hide elements
   matching those exact names by default, which silently breaks the
   banner on any desktop browser running such an extension while leaving
   mobile (which rarely has one installed) unaffected.
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
    wrap.className = 'ff-consent';
    wrap.innerHTML =
      '<div class="ff-consent-bar" id="ffConsentBar" role="dialog" aria-live="polite" aria-label="Cookie preferences">' +
        '<p>We use essential cookies to run this site, and optional analytics/marketing cookies to understand traffic and improve it. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="ff-consent-actions">' +
          '<button type="button" class="btn btn-outline" id="ffConsentCustomize">Customise</button>' +
          '<button type="button" class="btn btn-outline" id="ffConsentReject">Reject Non-Essential</button>' +
          '<button type="button" class="btn btn-primary" id="ffConsentAcceptAll">Accept All</button>' +
        '</div>' +
      '</div>' +
      '<div class="ff-consent-modal-overlay" id="ffConsentModalOverlay">' +
        '<div class="ff-consent-modal" role="dialog" aria-modal="true" aria-label="Cookie settings">' +
          '<h3>Cookie settings</h3>' +
          '<div class="ff-consent-row">' +
            '<div><strong>Essential</strong><p>Required for the site to function. Cannot be switched off.</p></div>' +
            '<label class="ff-consent-toggle disabled"><input type="checkbox" checked disabled><span></span></label>' +
          '</div>' +
          '<div class="ff-consent-row">' +
            '<div><strong>Analytics</strong><p>Helps us understand how visitors use the site so we can improve it.</p></div>' +
            '<label class="ff-consent-toggle"><input type="checkbox" id="ffConsentAnalytics"><span></span></label>' +
          '</div>' +
          '<div class="ff-consent-row">' +
            '<div><strong>Marketing</strong><p>Used to deliver relevant ads and measure campaign performance.</p></div>' +
            '<label class="ff-consent-toggle"><input type="checkbox" id="ffConsentMarketing"><span></span></label>' +
          '</div>' +
          '<div class="ff-consent-modal-actions">' +
            '<button type="button" class="btn btn-outline" id="ffConsentSavePrefs">Save Preferences</button>' +
            '<button type="button" class="btn btn-primary" id="ffConsentModalAcceptAll">Accept All</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function showBanner(el) { el.querySelector('#ffConsentBar').classList.add('open'); }
  function hideBanner(el) { el.querySelector('#ffConsentBar').classList.remove('open'); }
  function showModal(el) { el.querySelector('#ffConsentModalOverlay').classList.add('open'); }
  function hideModal(el) { el.querySelector('#ffConsentModalOverlay').classList.remove('open'); }

  function init() {
    var el = build();
    var existing = getConsent();

    if (!existing) {
      showBanner(el);
    }

    el.querySelector('#ffConsentAcceptAll').addEventListener('click', function () {
      saveConsent({ analytics: true, marketing: true });
      hideBanner(el);
    });
    el.querySelector('#ffConsentReject').addEventListener('click', function () {
      saveConsent({ analytics: false, marketing: false });
      hideBanner(el);
    });
    el.querySelector('#ffConsentCustomize').addEventListener('click', function () {
      openPreferences(el);
    });
    el.querySelector('#ffConsentModalAcceptAll').addEventListener('click', function () {
      saveConsent({ analytics: true, marketing: true });
      hideModal(el);
      hideBanner(el);
    });
    el.querySelector('#ffConsentSavePrefs').addEventListener('click', function () {
      saveConsent({
        analytics: el.querySelector('#ffConsentAnalytics').checked,
        marketing: el.querySelector('#ffConsentMarketing').checked
      });
      hideModal(el);
      hideBanner(el);
    });
    el.querySelector('#ffConsentModalOverlay').addEventListener('click', function (e) {
      if (e.target === this) hideModal(el);
    });

    function openPreferences(el) {
      var consent = getConsent() || { analytics: false, marketing: false };
      el.querySelector('#ffConsentAnalytics').checked = !!consent.analytics;
      el.querySelector('#ffConsentMarketing').checked = !!consent.marketing;
      showModal(el);
    }

    if (existing) applyConsent(existing);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
