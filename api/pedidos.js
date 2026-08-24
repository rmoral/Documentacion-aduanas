import { db, ESTADOS } from './_lib/db.js';
import { isAdmin } from './_lib/auth.js';

const REF_RE = /^AF[A-Z0-9]{4,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') return await crearPedido(req, res);
    if (req.method === 'GET') return await listarPedidos(req, res);
    if (req.method === 'PATCH') return await cambiarEstado(req, res);
    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return res.status(status).json({ error: status === 503 ? 'Base de datos no configurada' : 'Error interno' });
  }
}

/* POST público: guarda el pedido que envía el formulario antes del pago. */
async function crearPedido(req, res) {
  const b = req.body || {};
  const referencia = str(b.referencia, 12).toUpperCase();
  const nombre = str(b.remitente_nombre, 200);
  const email = str(b.remitente_email, 200);

  if (!REF_RE.test(referencia)) return res.status(400).json({ error: 'Referencia no válida' });
  if (!nombre) return res.status(400).json({ error: 'Falta el nombre del remitente' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email no válido' });

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
  return res.status(201).json({ ok: true, referencia });
}

/* GET admin: lista los pedidos, opcionalmente filtrados por estado. */
async function listarPedidos(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
  const estado = str((req.query && req.query.estado) || '', 20);
  const sql = await db();
  const rows = estado && ESTADOS.includes(estado)
    ? await sql`SELECT * FROM pedidos WHERE estado = ${estado} ORDER BY creado_en DESC LIMIT 500`
    : await sql`SELECT * FROM pedidos ORDER BY creado_en DESC LIMIT 500`;
  return res.status(200).json({ pedidos: rows });
}

/* PATCH admin: cambia el estado de un pedido. */
async function cambiarEstado(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
  const b = req.body || {};
  const referencia = str(b.referencia, 12).toUpperCase();
  const estado = str(b.estado, 20);
  if (!REF_RE.test(referencia)) return res.status(400).json({ error: 'Referencia no válida' });
  if (!ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado no válido' });
  const sql = await db();
  const rows = await sql`
    UPDATE pedidos SET estado = ${estado}, actualizado_en = now()
    WHERE referencia = ${referencia}
    RETURNING referencia, estado`;
  if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
  return res.status(200).json({ ok: true, pedido: rows[0] });
}
