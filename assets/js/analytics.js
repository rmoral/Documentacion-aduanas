/* ============================================================
   AduanaFácil Andorra · Analítica (sin cookies por defecto)

   Configuración (edita estas dos constantes):

   - PLAUSIBLE_DOMAIN: dominio dado de alta en https://plausible.io
     (analítica ligera y sin cookies: no requiere banner de
     consentimiento). Déjalo en "" para desactivar Plausible.
     IMPORTANTE: los datos solo se registran cuando el site esté
     dado de alta en una cuenta de Plausible con este dominio.

   - GA4_ID: ID de medición de Google Analytics 4 (formato
     "G-XXXXXXXXXX"). Déjalo en "" para no cargar GA4. Si se
     activa, valorar si es necesario un aviso de cookies.

   Este fichero lo cargan todas las páginas públicas del site con
   <script defer src=".../assets/js/analytics.js"></script>.
   ============================================================ */
(function () {
  'use strict';

  var PLAUSIBLE_DOMAIN = 'www.aduanafacilandorra.com';
  var GA4_ID = '';

  // No contaminar las métricas mientras se desarrolla en local
  var h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || window.location.protocol === 'file:') return;

  if (PLAUSIBLE_DOMAIN) {
    var p = document.createElement('script');
    p.defer = true;
    p.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
    p.src = 'https://plausible.io/js/script.outbound-links.js';
    document.head.appendChild(p);
  }

  if (GA4_ID) {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }
})();
