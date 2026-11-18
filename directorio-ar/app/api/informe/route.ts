// POST /api/informe — envía el informe por mail con Resend (opt-in).
// Variables de entorno: RESEND_API_KEY, MAIL_FROM (obligatorias) y MAIL_TO_LEADS (opcional: copia del pedido).
import { PedidoInformeSchema, armarMailInforme, mailConfigurado } from '../../../lib/informe-mail';
import { SITE_URL } from '../../../lib/sitio';

// ——— Rate limiting básico en memoria (por instancia del servidor) ———————————
// Alcanza para frenar abusos simples. Si hiciera falta algo más fuerte, usar un store compartido (p. ej. Upstash).
const VENTANA_MS = 10 * 60 * 1000;
const MAX_POR_VENTANA = 5;
const pedidos = new Map<string, number[]>();

function limitado(clave: string): boolean {
  const ahora = Date.now();
  const recientes = (pedidos.get(clave) ?? []).filter(t => ahora - t < VENTANA_MS);
  recientes.push(ahora);
  pedidos.set(clave, recientes);
  if (pedidos.size > 5000) {
    for (const [k, v] of pedidos) if (v.every(t => ahora - t >= VENTANA_MS)) pedidos.delete(k);
  }
  return recientes.length > MAX_POR_VENTANA;
}

function error(mensaje: string, status: number) {
  return Response.json({ ok: false, error: mensaje }, { status });
}

async function enviarConResend(body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text().catch(() => ''));
  return res.ok;
}

export async function POST(request: Request) {
  if (!mailConfigurado()) return error('El envío por mail no está disponible en este momento.', 503);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida';
  if (limitado(ip)) return error('Hiciste varios pedidos seguidos. Esperá unos minutos e intentá de nuevo.', 429);

  const largo = Number(request.headers.get('content-length') ?? 0);
  if (largo > 20_000) return error('El pedido es demasiado grande.', 413);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return error('No pudimos leer el pedido. Recargá la página e intentá de nuevo.', 400);
  }

  const parsed = PedidoInformeSchema.safeParse(json);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    const campo = primero?.path[0];
    const mensaje = campo === 'email' || campo === 'consentimiento' ? primero.message : 'Faltan datos del resultado. Volvé a abrir el resultado e intentá de nuevo.';
    return error(mensaje, 400);
  }
  const pedido = parsed.data;

  // Honeypot: respondemos "ok" para no darle pistas al bot, pero no enviamos nada.
  if (pedido.website) return Response.json({ ok: true });

  const { asunto, html, texto } = armarMailInforme(pedido, SITE_URL);
  const leads = process.env.MAIL_TO_LEADS;

  try {
    const ok = await enviarConResend({
      from: process.env.MAIL_FROM,
      to: [pedido.email],
      subject: asunto,
      html,
      text: texto,
      ...(leads ? { reply_to: leads } : {}),
    });
    if (!ok) return error('No pudimos enviar el mail. Intentá de nuevo en unos minutos.', 502);

    if (leads) {
      // Copia interna del pedido (mail + resumen), sin respuestas individuales.
      await enviarConResend({
        from: process.env.MAIL_FROM,
        to: [leads],
        subject: `Nuevo pedido de informe: ${pedido.empresa || 'sin nombre'} (${pedido.indice.total}/100)`,
        text: `Mail: ${pedido.email}\nEmpresa: ${pedido.empresa || '—'}\nÍndice: ${pedido.indice.total}/100 (${pedido.indice.nivel})\n\n${texto}`,
      }).catch(() => false);
    }
  } catch (e) {
    console.error('Error enviando informe', e);
    return error('No pudimos enviar el mail. Intentá de nuevo en unos minutos.', 502);
  }

  return Response.json({ ok: true });
}
