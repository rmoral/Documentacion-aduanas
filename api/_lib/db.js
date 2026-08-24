import { neon } from '@neondatabase/serverless';

let sql;
let schemaReady;

/* Devuelve el cliente SQL de Neon con el esquema garantizado.
   DATABASE_URL la inyecta Vercel al vincular la base de datos Neon
   (Storage → Create Database → Neon). */
export async function db() {
  if (!process.env.DATABASE_URL) {
    throw Object.assign(new Error('DATABASE_URL no configurada'), { status: 503 });
  }
  if (!sql) sql = neon(process.env.DATABASE_URL);
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        referencia              text PRIMARY KEY,
        estado                  text NOT NULL DEFAULT 'pendiente',
        remitente_nombre        text NOT NULL,
        remitente_documento     text,
        remitente_telefono      text,
        remitente_direccion     text,
        remitente_email         text NOT NULL,
        destinatario_nombre     text,
        destinatario_documento  text,
        destinatario_telefono   text,
        destinatario_direccion  text,
        mercancia_descripcion   text,
        mercancia_valor         numeric,
        fecha_envio             text,
        tiene_transportista     text,
        idioma                  text,
        creado_en               timestamptz NOT NULL DEFAULT now(),
        actualizado_en          timestamptz NOT NULL DEFAULT now()
      )`;
  }
  await schemaReady;
  return sql;
}

export const ESTADOS = ['pendiente', 'pagado', 'en_preparacion', 'entregado', 'cancelado'];
