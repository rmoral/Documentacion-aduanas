import { createHmac, timingSafeEqual } from 'node:crypto';

/* Verifica la firma de un webhook de Stripe (cabecera "stripe-signature")
   sin depender del SDK. Formato de la cabecera: "t=<ts>,v1=<hmac>[,v1=...]".
   La firma es HMAC-SHA256(secret, `${t}.${payload}`). */
export function verifyStripeSignature(payload, header, secret, toleranceSeconds = 300) {
  if (!payload || !header || !secret) return false;

  const parts = {};
  for (const kv of String(header).split(',')) {
    const i = kv.indexOf('=');
    if (i < 1) continue;
    const k = kv.slice(0, i).trim();
    const v = kv.slice(i + 1).trim();
    (parts[k] = parts[k] || []).push(v);
  }
  const t = parts.t && parts.t[0];
  const signatures = parts.v1 || [];
  if (!t || !signatures.length) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
  const expectedBuf = Buffer.from(expected);
  return signatures.some(sig => {
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });
}
