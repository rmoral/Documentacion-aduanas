/* ============================================================
   AduanaFácil Andorra · Lógica del formulario de pedido
   Estructura basada en landingaduanamuebles.html (raíz del repo)
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var STRIPE_PAYMENT_LINK = CFG.STRIPE_PAYMENT_LINK || '';
  var FORM_ENDPOINT = CFG.FORM_ENDPOINT || '';

  // Referencia única del pedido (ej. AF-K3X9ZQ)
  var ref = 'AF' + Date.now().toString(36).toUpperCase().slice(-6);
  document.getElementById('refnum').textContent = ref.slice(2);

  var step = 1;
  var TOTAL = 4;
  var form = document.getElementById('orderForm');
  var err = document.getElementById('formErr');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function show(n) {
    document.querySelectorAll('.fstep').forEach(function (s) {
      s.classList.toggle('visible', +s.dataset.step === n);
    });
    document.querySelectorAll('#progress span').forEach(function (p) {
      var i = +p.dataset.s;
      p.classList.toggle('active', i === n);
      p.classList.toggle('done', i < n);
    });
    document.getElementById('btnBack').style.visibility = n === 1 ? 'hidden' : 'visible';
    document.getElementById('btnNext').style.display = n === TOTAL ? 'none' : 'inline-block';
    err.classList.remove('show');
    if (n === TOTAL) buildSummary();
    document.querySelector('.form-doc').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validStep(n) {
    var ok = true;
    var fields = document.querySelector('.fstep[data-step="' + n + '"]').querySelectorAll('[required]');
    fields.forEach(function (f) {
      var valid = f.checkValidity() && f.value.trim() !== '';
      f.style.borderColor = valid ? '' : 'var(--stamp)';
      if (!valid) ok = false;
    });
    return ok;
  }

  function next() {
    if (!validStep(step)) { err.classList.add('show'); return; }
    step++;
    show(step);
  }

  document.getElementById('btnNext').addEventListener('click', next);
  document.getElementById('btnBack').addEventListener('click', function () {
    step--;
    show(step);
  });

  function buildSummary() {
    var g = function (id) { return esc(document.getElementById(id).value || '—'); };
    document.getElementById('summary').innerHTML =
      '<dt>Referencia</dt><dd>' + esc(ref) + '</dd>' +
      '<dt>Remitente</dt><dd>' + g('r_nombre') + ' · ' + g('r_doc') + ' · Andorra</dd>' +
      '<dt>Destinatario</dt><dd>' + g('d_nombre') + ' · ' + g('d_doc') + ' · ' + g('d_dir') + '</dd>' +
      '<dt>Mercancía</dt><dd>' + g('m_desc') + '</dd>' +
      '<dt>Valor declarado</dt><dd>' + g('m_valor') + ' €</dd>' +
      '<dt>Email de entrega</dt><dd>' + g('r_email') + '</dd>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Enter en un campo intermedio avanza de paso, no envía el pedido
    if (step < TOTAL) { next(); return; }

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Procesando…';

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.referencia = ref;
    data.fecha_pedido = new Date().toISOString();

    // El pedido queda registrado en el navegador para la página de confirmación
    try { localStorage.setItem('pedido_' + ref, JSON.stringify(data)); } catch (_) {}

    var sendData = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        }).catch(function () { /* el pedido sigue adelante; los datos van en la referencia */ })
      : Promise.resolve();

    sendData.then(function () {
      var stripeConfigured = STRIPE_PAYMENT_LINK &&
        STRIPE_PAYMENT_LINK.indexOf('buy.stripe.com') !== -1 &&
        STRIPE_PAYMENT_LINK.indexOf('TU_PAYMENT_LINK') === -1;

      if (stripeConfigured) {
        var url = new URL(STRIPE_PAYMENT_LINK);
        url.searchParams.set('client_reference_id', ref);
        url.searchParams.set('prefilled_email', data.remitente_email || '');
        window.location.href = url.toString();
      } else {
        // Modo demo / sin pago configurado: confirmación directa
        window.location.href = 'gracias.html?ref=' + encodeURIComponent(ref);
      }
    });
  });
})();
