/* ============================================================
   AduanaFácil Andorra · Email de solicitud (fase de valoración)
   Construye el email con todos los datos del pedido. Se redacta
   siempre en español porque lo recibe el equipo, no el cliente.
   Destinatario: SITE_CONFIG.ORDER_EMAIL (assets/js/config.js).
   ============================================================ */
(function () {
  'use strict';

  function line(label, v) { return label + ': ' + (v || '—'); }

  window.ORDER_EMAIL_HELPER = {
    subject: function (data) {
      return 'Solicitud de expediente ' + (data.referencia || '') + ' · AduanaFácil Andorra';
    },
    body: function (data) {
      return [
        'Nueva solicitud de expediente aduanero (formulario web)',
        line('Referencia', data.referencia),
        line('Fecha de la solicitud', data.fecha_pedido),
        '',
        '— REMITENTE (Andorra) —',
        line('Nombre', data.remitente_nombre),
        line('Documento', data.remitente_documento),
        line('Teléfono', data.remitente_telefono),
        line('Dirección', data.remitente_direccion),
        line('Email', data.remitente_email),
        '',
        '— DESTINATARIO (España) —',
        line('Nombre', data.destinatario_nombre),
        line('Documento', data.destinatario_documento),
        line('Teléfono', data.destinatario_telefono),
        line('Dirección de entrega', data.destinatario_direccion),
        '',
        '— ENVÍO —',
        line('Muebles', data.mercancia_descripcion),
        line('Valor estimado (€)', data.mercancia_valor),
        line('Fecha prevista', data.fecha_envio),
        line('¿Tiene transportista?', data.tiene_transportista),
        '',
        'Precio del servicio: 49,00 €. Pago pendiente de coordinar (fase de valoración, sin pasarela).'
      ].join('\n');
    },
    mailto: function (data) {
      var to = (window.SITE_CONFIG || {}).ORDER_EMAIL || '';
      if (!to) return '';
      return 'mailto:' + to +
        '?subject=' + encodeURIComponent(this.subject(data)) +
        '&body=' + encodeURIComponent(this.body(data));
    }
  };
})();
