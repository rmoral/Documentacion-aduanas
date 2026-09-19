/* Notificación por email al propietario vía Resend (https://resend.com).
   Configuración (variables de entorno en Vercel):
   - RESEND_API_KEY  (obligatoria para enviar; sin ella no se envía nada)
   - NOTIFY_EMAIL    destino de los avisos (por defecto rmoral81@gmail.com)
   - RESEND_FROM     remitente; por defecto onboarding@resend.dev, que
                     funciona sin verificar dominio pero solo entrega al
                     email de la cuenta Resend. Con el dominio verificado
                     en Resend, usar p. ej. "AduanaFácil <pedidos@aduanafacilandorra.com>"
   El envío nunca bloquea ni hace fallar el pedido. */

const esc = s => String(s == null || s === '' ? '—' : s)
  .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fila = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#7A8299;font-size:12px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:4px 0;color:#1B2A4A;font-size:14px">${esc(v)}</td></tr>`;

export async function notificarPedido(tipo, p) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const to = process.env.NOTIFY_EMAIL || 'rmoral81@gmail.com';
  const from = process.env.RESEND_FROM || 'AduanaFácil Andorra <onboarding@resend.dev>';

  const esPago = tipo === 'pagado';
  const subject = esPago
    ? `✅ Pedido pagado · ${p.referencia} · ${p.remitente_nombre || ''}`.trim()
    : `📥 Nuevo pedido · ${p.referencia} · ${p.remitente_nombre || ''} · ${p.mercancia_valor || '?'} €`.trim();

  const filas = esPago
    ? [fila('Referencia', p.referencia), fila('Remitente', p.remitente_nombre), fila('Email', p.remitente_email), fila('Valor declarado', p.mercancia_valor != null ? p.mercancia_valor + ' €' : null)]
    : [
        fila('Referencia', p.referencia),
        fila('Remitente', `${p.remitente_nombre} · ${p.remitente_documento || '—'} · ${p.remitente_telefono || '—'}`),
        fila('Email', p.remitente_email),
        fila('Dirección Andorra', p.remitente_direccion),
        fila('Destinatario', `${p.destinatario_nombre || '—'} · ${p.destinatario_documento || '—'}`),
        fila('Entrega en España', p.destinatario_direccion),
        fila('Mercancía', p.mercancia_descripcion),
        fila('Valor declarado', p.mercancia_valor != null ? p.mercancia_valor + ' €' : null),
        fila('Fecha envío prevista', p.fecha_envio),
        fila('Transportista', p.tiene_transportista === 'si' ? 'Contratado' : (p.tiene_transportista === 'buscando' ? 'Buscando' : null)),
        fila('Idioma', (p.idioma || 'es').toUpperCase()),
        fila('Pago', p.pago_metodo || null)
      ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px">
      <h2 style="color:#1B2A4A;border-bottom:2px solid #1B2A4A;padding-bottom:8px">
        ${esPago ? 'Pedido pagado' : 'Nuevo pedido recibido'} · ${esc(p.referencia)}
      </h2>
      <table style="border-collapse:collapse">${filas.join('')}</table>
      <p style="margin-top:18px"><a href="https://www.aduanafacilandorra.com/admin" style="color:#C1352B">Abrir el backoffice</a></p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
      signal: AbortSignal.timeout(8000)
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}
