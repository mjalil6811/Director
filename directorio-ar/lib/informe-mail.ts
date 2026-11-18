// Contrato del pedido "Recibí tu informe por mail" (lo usan el cliente y app/api/informe/route.ts).
// Solo viaja un RESUMEN del resultado, nunca las respuestas una por una.
import { z } from 'zod';

export const PedidoInformeSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email({ error: 'Revisá el mail: no parece válido.' })),
  consentimiento: z.literal(true, { error: 'Tenés que aceptar la Política de privacidad.' }),
  empresa: z.string().trim().max(120).optional(),
  indice: z.object({
    total: z.number().int().min(0).max(100),
    nivel: z.string().max(40),
  }),
  dimensiones: z.array(z.object({
    label: z.string().max(60),
    score: z.number().int().min(0).max(100),
  })).max(5),
  recomendaciones: z.array(z.string().max(400)).max(8),
  /** Honeypot: campo invisible. Si viene con texto, es un bot. */
  website: z.string().max(200).optional(),
});

export type PedidoInforme = z.infer<typeof PedidoInformeSchema>;

/** Solo en el servidor: ¿están las variables para enviar mails? Si no, el bloque no se muestra. */
export function mailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function armarMailInforme(p: PedidoInforme, siteUrl: string): { asunto: string; html: string; texto: string } {
  const empresa = p.empresa ? ` · ${p.empresa}` : '';
  const asunto = `Tu informe de Directorio AR${empresa}: Índice ${p.indice.total}/100`;

  const filas = p.dimensiones
    .map(d => `<tr><td style="padding:6px 0;color:#374151">${esc(d.label)}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">${d.score}/100</td></tr>`)
    .join('');
  const recos = p.recomendaciones.map(r => `<li style="margin:0 0 8px">${esc(r)}</li>`).join('');

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#FAFBFC;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#534AB7;text-transform:uppercase;letter-spacing:.05em">Directorio AR${esc(empresa)}</p>
    <h1 style="margin:0 0 4px;font-size:22px;color:#111827">Índice de preparación: ${p.indice.total}/100</h1>
    <p style="margin:0 0 20px;color:#6B7280;font-size:14px">Nivel: ${esc(p.indice.nivel)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #F3F4F6">${filas}</table>
    ${recos ? `<h2 style="font-size:15px;color:#111827;margin:24px 0 8px">Recomendaciones</h2><ul style="padding-left:18px;margin:0;font-size:14px;color:#374151;line-height:1.5">${recos}</ul>` : ''}
    <p style="margin:24px 0 0;font-size:14px"><a href="${esc(siteUrl)}/resultado" style="color:#534AB7;font-weight:700">Ver el resultado completo →</a><br>
    <span style="color:#6B7280;font-size:12px">(se abre con los datos guardados en el navegador donde hiciste el diagnóstico)</span></p>
  </div>
  <p style="font-size:11px;color:#6B7280;line-height:1.5;margin:16px 4px 0">
    Resultado orientativo: no constituye asesoramiento legal, contable ni financiero.
    Recibiste este mail porque lo pediste en Directorio AR. Para pedir la baja de tus datos, respondé este mail.
    <a href="${esc(siteUrl)}/privacidad" style="color:#6B7280">Política de privacidad</a>.
  </p>
</div></body></html>`;

  const texto = [
    `Directorio AR${empresa}`,
    `Índice de preparación: ${p.indice.total}/100 (${p.indice.nivel})`,
    '',
    ...p.dimensiones.map(d => `- ${d.label}: ${d.score}/100`),
    ...(p.recomendaciones.length ? ['', 'Recomendaciones:', ...p.recomendaciones.map(r => `- ${r}`)] : []),
    '',
    `Resultado completo: ${siteUrl}/resultado`,
    'Resultado orientativo: no constituye asesoramiento legal, contable ni financiero.',
    'Para pedir la baja de tus datos, respondé este mail.',
  ].join('\n');

  return { asunto, html, texto };
}
