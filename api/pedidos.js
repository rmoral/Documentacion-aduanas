import { db, ESTADOS } from './_lib/db.js';
import { isAdmin } from './_lib/auth.js';
import { REF_RE, str, guardarPedido, estadoPedido, pagoOnline } from './_lib/pedidos-core.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method === 'POST') return await crearPedido(req, res);
    if (req.method === 'GET') return await consultar(req, res);
    if (req.method === 'PATCH') return await cambiarEstado(req, res);
    res.setHeader('Allow', 'GET, POST, PATCH, OPTIONS');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return res.status(status).json({ error: status === 503 ? 'Base de datos no configurada' : 'Error interno' });
  }
}

/* POST público: guarda el pedido (del formulario web o de un agente de IA).
   La respuesta incluye la referencia y las instrucciones de pago. */
async function crearPedido(req, res) {
  const r = await guardarPedido(req.body);
  return res.status(r.status).json(r.body);
}

/* GET con ?ref= y ?email=: estado público de un pedido (sin token).
   GET sin ref: listado completo, solo administración. */
async function consultar(req, res) {
  const q = req.query || {};
  // Configuración pública: el front y los agentes saben si el pago online está activo
  if (q.config) return res.status(200).json({ pago_online: pagoOnline() });
  if (q.ref) {
    const row = await estadoPedido(q.ref, q.email || '');
    if (!row) return res.status(404).json({ error: 'Pedido no encontrado (comprueba referencia y email del remitente)' });
    return res.status(200).json({ pedido: row });
  }
  if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
  const estado = str(q.estado || '', 20);
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
