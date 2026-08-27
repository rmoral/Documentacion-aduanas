/* ============================================================
   AduanaFácil Andorra · Analítica con consentimiento

   Configuración (edita estas dos constantes):

   - GA4_ID: ID de medición de Google Analytics 4 ("G-XXXXXXXXXX").
     Como GA4 usa cookies, SOLO se carga tras el consentimiento del
     visitante: este script muestra un banner (en el idioma de la
     página) y guarda la elección en localStorage. Déjalo en "" para
     desactivar GA4 y no mostrar banner.

   - PLAUSIBLE_DOMAIN: alternativa/complemento sin cookies
     (https://plausible.io). No requiere consentimiento, se carga
     siempre. Déjalo en "" si no hay cuenta de Plausible.

   Este fichero lo cargan todas las páginas públicas del site con
   <script defer src=".../assets/js/analytics.js"></script>.
   ============================================================ */
(function () {
  'use strict';

  var GA4_ID = 'G-R90F53PYSP';
  var PLAUSIBLE_DOMAIN = '';
  var CONSENT_KEY = 'cookie_consent_v1';

  // No contaminar las métricas mientras se desarrolla en local
  var h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || window.location.protocol === 'file:') return;

  /* ---------- Plausible (sin cookies, sin consentimiento) ---------- */
  if (PLAUSIBLE_DOMAIN) {
    var p = document.createElement('script');
    p.defer = true;
    p.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    p.src = 'https://plausible.io/js/script.outbound-links.js';
    document.head.appendChild(p);
  }

  /* ---------- GA4 (con cookies: requiere consentimiento) ---------- */
  if (!GA4_ID) return;

  function loadGA4() {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true });
  }

  var stored = null;
  try { stored = localStorage.getItem(CONSENT_KEY); } catch (_) {}
  if (stored === 'granted') { loadGA4(); return; }
  if (stored === 'denied') return;

  /* Banner de consentimiento en el idioma de la página */
  var TXT = {
    es: {
      label: 'Aviso de cookies',
      msg: 'Usamos cookies de análisis (Google Analytics) para entender cómo se usa la web y mejorarla.',
      more: 'Más información', accept: 'Aceptar', reject: 'Rechazar',
      privacy: '/privacidad.html'
    },
    ca: {
      label: 'Avís de galetes',
      msg: "Fem servir galetes d'anàlisi (Google Analytics) per entendre com s'utilitza el web i millorar-lo.",
      more: 'Més informació', accept: 'Acceptar', reject: 'Rebutjar',
      privacy: '/ca/privacidad.html'
    },
    en: {
      label: 'Cookie notice',
      msg: 'We use analytics cookies (Google Analytics) to understand how the site is used and improve it.',
      more: 'More information', accept: 'Accept', reject: 'Reject',
      privacy: '/en/privacidad.html'
    },
    fr: {
      label: 'Avis relatif aux cookies',
      msg: "Nous utilisons des cookies de mesure d'audience (Google Analytics) pour comprendre l'utilisation du site et l'améliorer.",
      more: 'En savoir plus', accept: 'Accepter', reject: 'Refuser',
      privacy: '/fr/privacidad.html'
    },
    ru: {
      label: 'Уведомление о cookie',
      msg: 'Мы используем аналитические cookie (Google Analytics), чтобы понимать, как используется сайт, и улучшать его.',
      more: 'Подробнее', accept: 'Принять', reject: 'Отклонить',
      privacy: '/ru/privacidad.html'
    }
  };
  var lang = (document.documentElement.lang || 'es').slice(0, 2);
  var t = TXT[lang] || TXT.es;

  function showBanner() {
    var bar = document.createElement('div');
    bar.id = 'cookieConsent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', t.label);
    bar.setAttribute('aria-modal', 'false');
    bar.setAttribute('aria-live', 'polite');
    bar.style.cssText =
      'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#F7F5F0;' +
      'border-top:2px solid #1B2A4A;box-shadow:0 -4px 16px rgba(27,42,74,.12);' +
      'padding:14px 20px;font-family:\'Libre Franklin\',sans-serif;font-size:.9rem;color:#1B2A4A';
    bar.innerHTML =
      '<div style="max-width:960px;margin:0 auto;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap">' +
      '<span>' + t.msg + ' <a href="' + t.privacy + '" style="color:#1B2A4A">' + t.more + '</a></span>' +
      '<span style="display:flex;gap:10px;flex-shrink:0">' +
      '<button id="ccReject" style="background:transparent;border:2px solid #1B2A4A;color:#1B2A4A;padding:8px 18px;border-radius:4px;font-weight:700;cursor:pointer">' + t.reject + '</button>' +
      '<button id="ccAccept" style="background:#C1352B;border:none;color:#fff;padding:8px 22px;border-radius:4px;font-weight:700;cursor:pointer;box-shadow:0 2px 0 #8E241C">' + t.accept + '</button>' +
      '</span></div>';
    document.body.appendChild(bar);

    function choose(value) {
      try { localStorage.setItem(CONSENT_KEY, value); } catch (_) {}
      bar.remove();
      if (value === 'granted') loadGA4();
    }
    document.getElementById('ccAccept').addEventListener('click', function () { choose('granted'); });
    document.getElementById('ccReject').addEventListener('click', function () { choose('denied'); });
  }

  if (document.body) { showBanner(); }
  else { document.addEventListener('DOMContentLoaded', showBanner); }
})();
