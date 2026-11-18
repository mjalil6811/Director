// Cantidad de preguntas del diagnóstico, calculada desde los datos de cada módulo (no se escribe a mano).
// Los minutos estimados están en MODULOS_F1 (lib/navegacion.ts).
import { TOTAL_PREGUNTAS as M1 } from './modulo1';
import { SITUACIONES_M2 } from './modulo2';
import { TOTAL_PREGUNTAS_M3 } from './modulo3';
import { TOTAL_DIAG } from './preguntas';
import { TOTAL_M5 } from './modulo5';
import { TOTAL_MIN_F1 } from './navegacion';

export const PREGUNTAS_POR_MODULO: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: M1,
  2: SITUACIONES_M2.length,
  3: TOTAL_PREGUNTAS_M3,
  4: TOTAL_DIAG,
  5: TOTAL_M5,
};

export const TOTAL_PREGUNTAS_F1 = Object.values(PREGUNTAS_POR_MODULO).reduce((a, n) => a + n, 0);

const SEG_POR_PREGUNTA = (TOTAL_MIN_F1 * 60) / TOTAL_PREGUNTAS_F1;

/**
 * Posición en el diagnóstico completo: "Pregunta X de N · ~Y min restantes".
 * En el recorrido abreviado solo cuentan los Módulos 1 y 2.
 */
export function progresoGlobal(modulo: 1 | 2 | 3 | 4 | 5, numero: number, abreviado = false) {
  const modulos = (abreviado ? [1, 2] : [1, 2, 3, 4, 5]) as (1 | 2 | 3 | 4 | 5)[];
  const total = modulos.reduce((a, m) => a + PREGUNTAS_POR_MODULO[m], 0);
  const previas = modulos.filter(m => m < modulo).reduce((a, m) => a + PREGUNTAS_POR_MODULO[m], 0);
  const actual = Math.min(total, previas + numero);
  const minRestantes = Math.max(1, Math.round(((total - actual + 1) * SEG_POR_PREGUNTA) / 60));
  return { actual, total, minRestantes };
}
