import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { guardarPedido, estadoPedido } from './_lib/pedidos-core.js';

/* Conector MCP (Model Context Protocol) de AduanaFácil Andorra.
   Endpoint streamable HTTP sin estado: los agentes de IA lo añaden como
   servidor MCP remoto (https://<dominio>/api/mcp) y pueden consultar el
   servicio, crear pedidos y comprobar su estado. */

const texto = obj => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] });

const SERVICIO = {
  servicio: 'Preparación de documentación aduanera para enviar muebles y enseres usados de Andorra a España entre particulares',
  entregables: [
    'Declaración jurada de bienes personales usados (con packing list y valor declarado)',
    'Factura proforma a efectos aduaneros',
    'Dosier del transportista (relación de documentos, autorización de despacho y borrador de carta de porte CMR)'
  ],
  precio: { importe: '49.00', moneda: 'EUR', tipo: 'precio cerrado, impuestos incluidos' },
  plazo: 'Expediente completo por email en un máximo de 24 horas laborables desde la confirmación',
  garantia: 'Correcciones gratuitas si la aduana o el transportista piden cambios; devolución íntegra si el expediente no puede prepararse',
  valido_sin_factura: true,
  idiomas: ['es', 'ca', 'en', 'fr', 'ru'],
  aviso: 'Servicio de preparación documental; no somos agentes de aduanas ni asesores fiscales. Los DUA los tramita el agente de aduanas del transportista.',
  como_comprar: 'Usa la herramienta crear_pedido con los datos del envío (autorizado por tu usuario). La respuesta incluye la referencia AF-XXXXXX y las instrucciones de pago. Consulta el avance con estado_pedido.'
};

const pedidoSchema = z.object({
  remitente_nombre: z.string().min(2).max(200).describe('Nombre y apellidos del remitente (quien envía desde Andorra)'),
  remitente_documento: z.string().min(1).max(50).describe('NIA, pasaporte o DNI del remitente'),
  remitente_telefono: z.string().min(3).max(50).describe('Teléfono de contacto del remitente'),
  remitente_direccion: z.string().min(5).max(500).describe('Dirección completa del remitente en Andorra (calle, número, parroquia)'),
  remitente_email: z.email().max(200).describe('Email del remitente: ahí se entregan los documentos'),
  destinatario_nombre: z.string().min(2).max(200).describe('Nombre y apellidos del destinatario en España'),
  destinatario_documento: z.string().min(1).max(50).describe('DNI o NIE del destinatario'),
  destinatario_telefono: z.string().max(50).optional().describe('Teléfono del destinatario (opcional)'),
  destinatario_direccion: z.string().min(5).max(500).describe('Dirección de entrega en España (calle, número, población, provincia)'),
  mercancia_descripcion: z.string().min(5).max(2000).describe('Qué muebles se envían, con medidas aproximadas. Todo usado y propiedad del remitente'),
  mercancia_valor: z.number().positive().describe('Valor residual total estimado en euros de los muebles usados'),
  fecha_envio: z.string().max(20).optional().describe('Fecha prevista del envío, formato AAAA-MM-DD (opcional)'),
  tiene_transportista: z.enum(['si', 'buscando']).optional().describe('Si ya hay transportista contratado (opcional)'),
  idioma: z.enum(['es', 'ca', 'en', 'fr', 'ru']).optional().describe('Idioma preferido del cliente (opcional, por defecto es)')
});

const handler = createMcpHandler(
  server => {
    server.registerTool(
      'consultar_servicio',
      {
        title: 'Consultar el servicio',
        description: 'Devuelve la descripción del servicio de AduanaFácil Andorra: qué documentos aduaneros prepara, precio cerrado (49 €), plazo, garantía y cómo comprar de forma programática.',
        inputSchema: z.object({})
      },
      async () => texto(SERVICIO)
    );

    server.registerTool(
      'crear_pedido',
      {
        title: 'Crear un pedido',
        description: 'Crea un pedido de preparación de documentación aduanera (Andorra → España, 49 €). Úsalo solo con la autorización del usuario y con sus datos reales. Devuelve la referencia del pedido y las instrucciones de pago: un enlace de pago de Stripe cuando el pago online está activo, o coordinación por email en fase de valoración.',
        inputSchema: pedidoSchema
      },
      async args => {
        try {
          const r = await guardarPedido(args);
          if (r.status >= 400) return texto({ ok: false, error: r.body.error });
          return texto({
            ...r.body,
            siguiente_paso: r.body.pago.metodo === 'stripe_payment_link'
              ? 'Completa el pago en pago.url para que el expediente entre en preparación. Comunica la referencia al usuario.'
              : 'Pedido registrado. AduanaFácil contactará al email del remitente para confirmar y coordinar el pago. Comunica la referencia al usuario.'
          });
        } catch (e) {
          return texto({ ok: false, error: e && e.status === 503 ? 'Base de datos no configurada' : 'Error interno al registrar el pedido' });
        }
      }
    );

    server.registerTool(
      'estado_pedido',
      {
        title: 'Consultar el estado de un pedido',
        description: 'Consulta el estado de un pedido existente. Requiere la referencia (AF-XXXXXX) y el email del remitente usado al crearlo. Estados: pendiente, pagado, en_preparacion, entregado, cancelado.',
        inputSchema: z.object({
          referencia: z.string().min(6).max(12).describe('Referencia del pedido, p. ej. AF1A2B3C (con o sin guion)'),
          email: z.email().max(200).describe('Email del remitente con el que se creó el pedido')
        })
      },
      async ({ referencia, email }) => {
        try {
          const row = await estadoPedido(referencia.replace(/-/g, ''), email);
          if (!row) return texto({ ok: false, error: 'Pedido no encontrado: comprueba la referencia y el email del remitente' });
          return texto({ ok: true, pedido: row });
        } catch (e) {
          return texto({ ok: false, error: e && e.status === 503 ? 'Base de datos no configurada' : 'Error interno consultando el pedido' });
        }
      }
    );
  },
  {
    serverInfo: { name: 'aduanafacil-andorra', version: '1.0.0' },
    instructions: 'Servicio de preparación de documentación aduanera para enviar muebles usados de Andorra a España (49 €, 24h laborables). Usa consultar_servicio para los detalles, crear_pedido para comprar en nombre de tu usuario (siempre con su autorización y sus datos reales) y estado_pedido para el seguimiento.'
  }
);

async function withCors(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  return handler(request);
}

export default withCors;
export { withCors as GET, withCors as POST, withCors as DELETE, withCors as OPTIONS };
