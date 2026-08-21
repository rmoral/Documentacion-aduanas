import { db } from './_lib/db.js';
import { verifyStripeSignature } from './_lib/stripe.js';

/* El cuerpo debe llegar sin parsear para poder verificar la firma. */
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET no configurado' });

  try {
    const payload = await readRawBody(req);
    if (!verifyStripeSignature(payload, req.headers['stripe-signature'], secret)) {
      return res.status(400).json({ error: 'Firma no válida' });
    }

    const event = JSON.parse(payload);
    if (event.type === 'checkout.session.completed') {
      const ref = String((event.data && event.data.object && event.data.object.client_reference_id) || '').toUpperCase();
      if (/^AF[A-Z0-9]{4,10}$/.test(ref)) {
        const sql = await db();
        await sql`
          UPDATE pedidos SET estado = 'pagado', actualizado_en = now()
          WHERE referencia = ${ref} AND estado = 'pendiente'`;
      }
    }
    // Stripe solo necesita un 200 para dar el evento por entregado
    return res.status(200).json({ received: true });
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return res.status(status).json({ error: status === 503 ? 'Base de datos no configurada' : 'Error interno' });
  }
}
