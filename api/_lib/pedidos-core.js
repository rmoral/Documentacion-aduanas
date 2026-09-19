import { randomBytes } from 'node:crypto';
import { db, ESTADOS } from './db.js';
import { notificarPedido } from './notify.js';

export const REF_RE = /^AF[A-Z0-9]{4,10}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function nuevaReferencia() {
  return 'AF' + randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

/* Instrucciones de pago para la respuesta de la API y del conector MCP.
   Con STRIPE_PAYMENT_LINK configurado (variable de entorno en Vercel), el
   pedido se paga en el enlace devuelto; sin configurar, fase de valoración. */
export function pagoOnline() {
  return (process.env.STRIPE_PAYMENT_LINK || '').indexOf('buy.stripe.com') !== -1;
}

export function buildPago(referencia, email) {
  const link = process.env.STRIPE_PAYMENT_LINK || '';
  if (link.indexOf('buy.stripe.com') !== -1) {
    const url = new URL(link);
    url.searchParams.set('client_reference_id', referencia);
    if (email) url.searchParams.set('prefilled_email', email);
    return {
      metodo: 'stripe_payment_link',
      importe: '49.00',
      moneda: 'EUR',
      url: url.toString(),
      instrucciones: 'Completa el pago en la URL indicada (Stripe Checkout). El pedido se marca como pagado automáticamente al confirmarse el pago; conserva la referencia.'
    };
  }
  return {
    metodo: 'coordinacion_email',
    importe: '49.00',
    moneda: 'EUR',
    instrucciones: 'Fase de valoración: no se requiere pago inmediato. AduanaFácil contactará al email del remitente para confirmar la solicitud y coordinar el pago de 49 €.'
  };
}

/* Valida y persiste un pedido. Devuelve {status, body} listo para responder.
   Si no llega referencia, se genera una en el servidor (útil para agentes). */
export async function guardarPedido(b) {
  b = b || {};
  const referencia = b.referencia ? str(b.referencia, 12).toUpperCase() : nuevaReferencia();
  const nombre = str(b.remitente_nombre, 200);
  const email = str(b.remitente_email, 200);

  if (!REF_RE.test(referencia)) return { status: 400, body: { error: 'Referencia no válida' } };
  if (!nombre) return { status: 400, body: { error: 'Falta el nombre del remitente' } };
  if (!EMAIL_RE.test(email)) return { status: 400, body: { error: 'Email no válido' } };

  const valorNum = Number(b.mercancia_valor);
  const valor = Number.isFinite(valorNum) && valorNum > 0 ? valorNum : null;

  const sql = await db();
  await sql`
    INSERT INTO pedidos (
      referencia, remitente_nombre, remitente_documento, remitente_telefono,
      remitente_direccion, remitente_email, destinatario_nombre,
      destinatario_documento, destinatario_telefono, destinatario_direccion,
      mercancia_descripcion, mercancia_valor, fecha_envio, tiene_transportista, idioma
    ) VALUES (
      ${referencia}, ${nombre}, ${str(b.remitente_documento, 50)}, ${str(b.remitente_telefono, 50)},
      ${str(b.remitente_direccion)}, ${email}, ${str(b.destinatario_nombre, 200)},
      ${str(b.destinatario_documento, 50)}, ${str(b.destinatario_telefono, 50)}, ${str(b.destinatario_direccion)},
      ${str(b.mercancia_descripcion, 2000)}, ${valor}, ${str(b.fecha_envio, 20)}, ${str(b.tiene_transportista, 20)}, ${str(b.idioma, 5)}
    )
    ON CONFLICT (referencia) DO UPDATE SET
      remitente_nombre = EXCLUDED.remitente_nombre,
      remitente_documento = EXCLUDED.remitente_documento,
      remitente_telefono = EXCLUDED.remitente_telefono,
      remitente_direccion = EXCLUDED.remitente_direccion,
      remitente_email = EXCLUDED.remitente_email,
      destinatario_nombre = EXCLUDED.destinatario_nombre,
      destinatario_documento = EXCLUDED.destinatario_documento,
      destinatario_telefono = EXCLUDED.destinatario_telefono,
      destinatario_direccion = EXCLUDED.destinatario_direccion,
      mercancia_descripcion = EXCLUDED.mercancia_descripcion,
      mercancia_valor = EXCLUDED.mercancia_valor,
      fecha_envio = EXCLUDED.fecha_envio,
      tiene_transportista = EXCLUDED.tiene_transportista,
      idioma = EXCLUDED.idioma,
      actualizado_en = now()`;

  const pago = buildPago(referencia, email);

  // Aviso al propietario; nunca bloquea ni hace fallar el pedido
  await notificarPedido('nuevo', {
    referencia,
    remitente_nombre: nombre,
    remitente_documento: str(b.remitente_documento, 50),
    remitente_telefono: str(b.remitente_telefono, 50),
    remitente_direccion: str(b.remitente_direccion),
    remitente_email: email,
    destinatario_nombre: str(b.destinatario_nombre, 200),
    destinatario_documento: str(b.destinatario_documento, 50),
    destinatario_direccion: str(b.destinatario_direccion),
    mercancia_descripcion: str(b.mercancia_descripcion, 2000),
    mercancia_valor: valor,
    fecha_envio: str(b.fecha_envio, 20),
    tiene_transportista: str(b.tiene_transportista, 20),
    idioma: str(b.idioma, 5),
    pago_metodo: pago.metodo
  });

  return {
    status: 201,
    body: { ok: true, referencia, estado: 'pendiente', pago }
  };
}

/* Estado público de un pedido: exige referencia + email del remitente para
   no exponer datos a quien solo conozca (o adivine) la referencia. */
export async function estadoPedido(referencia, email) {
  referencia = str(referencia, 12).toUpperCase();
  email = str(email, 200);
  if (!REF_RE.test(referencia) || !EMAIL_RE.test(email)) return null;
  const sql = await db();
  const rows = await sql`
    SELECT referencia, estado, creado_en, actualizado_en
    FROM pedidos
    WHERE referencia = ${referencia} AND lower(remitente_email) = lower(${email})
    LIMIT 1`;
  return rows[0] || null;
}

export { ESTADOS };
