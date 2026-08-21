import { timingSafeEqual } from 'node:crypto';

/* Comprueba el token de administración (variable de entorno ADMIN_TOKEN)
   contra la cabecera "Authorization: Bearer <token>". */
export function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN || '';
  if (!expected) return false;
  const header = req.headers['authorization'] || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
