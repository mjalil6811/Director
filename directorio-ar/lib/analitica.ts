// Analítica desacoplada del proveedor. Hoy usa Vercel Web Analytics (sin cookies, sin datos personales).
// Para pasar a Plausible u otro, cambiar solo `enviar()`.
//
// Regla: los eventos NUNCA llevan respuestas del usuario, nombre de empresa, mail ni texto libre.
// Por eso cada evento tiene propiedades tipadas y cerradas.

import { track } from '@vercel/analytics';
import { progresoF1 } from './progreso';

type Eventos = {
  landing_cta_click: { ubicacion: 'header' | 'hero' | 'medio' | 'cierre' | 'recorrido' };
  diagnostico_iniciado: Record<string, never>;
  modulo_completado: { modulo: 1 | 2 | 3 | 4 | 5 };
  diagnostico_completado: { recorrido: 'completo' | 'abreviado' };
  resultado_exportado: { formato: 'pdf' | 'json' };
  informe_mail_solicitado: Record<string, never>;
};

export type NombreEvento = keyof Eventos;

function enviar(nombre: string, props?: Record<string, string | number>) {
  try {
    track(nombre, props);
  } catch {
    // la analítica nunca debe romper la app
  }
}

export function trackEvent<E extends NombreEvento>(
  nombre: E,
  ...props: Eventos[E] extends Record<string, never> ? [] : [Eventos[E]]
): void {
  enviar(nombre, props[0] as Record<string, string | number> | undefined);
}

/**
 * Llamar justo DESPUÉS de guardar el resultado de un módulo de la Fase 1.
 * Registra el módulo y, si con eso termina el recorrido (completo o abreviado), el diagnóstico.
 */
export function registrarModuloCompletado(modulo: 1 | 2 | 3 | 4 | 5): void {
  trackEvent('modulo_completado', { modulo });
  const p = progresoF1();
  if (p.terminado && modulo === p.total) {
    trackEvent('diagnostico_completado', { recorrido: p.abreviado ? 'abreviado' : 'completo' });
  }
}
