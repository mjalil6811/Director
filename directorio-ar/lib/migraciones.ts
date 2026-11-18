// Migraciones de los datos guardados en el navegador (localStorage).
// Las claves NO cambian: se transforma el contenido y se registra la versión en `ESQUEMA_KEY`.
// Corre una sola vez por navegador (y otra vez después de importar un respaldo viejo).
import { calcularModulo1 } from './modulo1';

export const ESQUEMA_KEY = 'directorio_ar:schema_version';
export const ESQUEMA_ACTUAL = 3;

const M1_RESPUESTAS = 'directorio_ar:modulo1:respuestas_v2';
const M1_RESULTADO = 'directorio_ar:modulo1:resultado';

/**
 * v1 → v2 (nov 2026, diagnóstico v2):
 * - Módulo 1 pasa de 10 a 13 preguntas. Se agregan "conflicto" (pos. 6), "dependencia" (pos. 8) y
 *   "objetivo" (pos. 12), sin responder.
 * - Empleados pasa de 4 a 5 tramos: "Menos de 50" (0) → "De 10 a 49" (1); el resto corre un lugar.
 *   Los dos tramos de menos de 50 valen 0, así que el puntaje guardado no cambia.
 * - Se renombran dos dimensiones en el resultado guardado.
 */
function v1aV2(datos: Record<string, string>): Record<string, string> {
  const out = { ...datos };

  const r = parse<number[]>(out[M1_RESPUESTAS]);
  if (Array.isArray(r) && r.length === 10) {
    const emp = r[3] >= 0 ? r[3] + 1 : -1;
    const nuevo = [r[0], r[1], r[2], emp, r[4], r[5], -1, r[6], -1, r[7], r[8], r[9], -1];
    out[M1_RESPUESTAS] = JSON.stringify(nuevo);
  }

  const res = parse<{ scoresPorDimension?: { key?: string; nombre: string }[] }>(out[M1_RESULTADO]);
  if (res?.scoresPorDimension) {
    const NOMBRES: Record<string, string> = { gobierno: 'Concentración de decisiones', decisiones: 'Rutina de reuniones' };
    res.scoresPorDimension = res.scoresPorDimension.map(d => (d.key && NOMBRES[d.key] ? { ...d, nombre: NOMBRES[d.key] } : d));
    out[M1_RESULTADO] = JSON.stringify(res);
  }

  return out;
}

/**
 * v2 → v3 (nov 2026, ejes Necesidad × Disposición):
 * el porcentaje del Módulo 1 deja de incluir el presupuesto. Se recalcula el resultado desde las respuestas.
 */
function v2aV3(datos: Record<string, string>): Record<string, string> {
  const r = parse<number[]>(datos[M1_RESPUESTAS]);
  if (!datos[M1_RESULTADO] || !Array.isArray(r) || !r.some(v => v >= 0)) return datos;
  return { ...datos, [M1_RESULTADO]: JSON.stringify(calcularModulo1(r)) };
}

const PASOS: Record<number, (d: Record<string, string>) => Record<string, string>> = { 1: v1aV2, 2: v2aV3 };

function parse<T>(v: string | undefined): T | null {
  if (v === undefined) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

/** Función pura (testeable): recibe clave → valor crudo y devuelve los datos migrados a la versión actual. */
export function migrarDatos(datos: Record<string, string>): Record<string, string> {
  let version = Number(parse<number>(datos[ESQUEMA_KEY]) ?? 1);
  let out = datos;
  while (version < ESQUEMA_ACTUAL) {
    const paso = PASOS[version];
    if (paso) out = paso(out);
    version++;
  }
  return { ...out, [ESQUEMA_KEY]: JSON.stringify(ESQUEMA_ACTUAL) };
}

/** Aplica las migraciones pendientes sobre localStorage. Nunca lanza. */
export function aplicarMigraciones(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(ESQUEMA_KEY) === String(ESQUEMA_ACTUAL)) return;
    const datos: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('directorio_ar:')) datos[k] = localStorage.getItem(k) ?? '';
    }
    const migrados = migrarDatos(datos);
    for (const [k, v] of Object.entries(migrados)) if (datos[k] !== v) localStorage.setItem(k, v);
  } catch {
    // modo privado o cuota llena: se reintenta en la próxima carga
  }
}
