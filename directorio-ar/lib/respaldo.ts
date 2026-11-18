// Respaldo del progreso: exporta e importa TODAS las claves `directorio_ar:*` de localStorage tal cual
// están guardadas (no cambia ninguna clave ni su formato).

export const PREFIJO = 'directorio_ar:';
import { ESQUEMA_ACTUAL, ESQUEMA_KEY, aplicarMigraciones } from './migraciones';

/** Versión del formato de los datos. Un respaldo de una versión anterior se migra al importarlo. */
export const SCHEMA_VERSION = ESQUEMA_ACTUAL;
const APP = 'directorio-ar';

export interface Respaldo {
  app: typeof APP;
  schemaVersion: number;
  exportadoEn: string;
  /** clave → valor crudo (string JSON) tal como está en localStorage */
  datos: Record<string, string>;
}

function clavesGuardadas(): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIJO)) out.push(k);
    }
  } catch {
    // sin acceso a localStorage
  }
  return out;
}

/** ¿Hay datos del usuario? La marca de versión de esquema no cuenta (existe aunque no haya respuestas). */
export function hayDatosGuardados(): boolean {
  return clavesGuardadas().some(k => k !== ESQUEMA_KEY);
}

export function crearRespaldo(): Respaldo {
  const datos: Record<string, string> = {};
  for (const k of clavesGuardadas()) {
    const v = localStorage.getItem(k);
    if (v !== null) datos[k] = v;
  }
  return { app: APP, schemaVersion: SCHEMA_VERSION, exportadoEn: new Date().toISOString(), datos };
}

export function descargarRespaldo(): void {
  const r = crearRespaldo();
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directorio-ar-respaldo-${r.exportadoEn.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type ResultadoValidacion = { ok: true; respaldo: Respaldo } | { ok: false; error: string };

/** Valida el contenido de un archivo de respaldo. Los mensajes de error son para mostrar al usuario. */
export function validarRespaldo(texto: string): ResultadoValidacion {
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    return { ok: false, error: 'El archivo no es un respaldo válido (no es un JSON legible).' };
  }
  if (!json || typeof json !== 'object') return { ok: false, error: 'El archivo no tiene el formato de un respaldo de Directorio AR.' };
  const r = json as Partial<Respaldo>;
  if (r.app !== APP) return { ok: false, error: 'Este archivo no es un respaldo de Directorio AR.' };
  if (typeof r.schemaVersion !== 'number') return { ok: false, error: 'Al respaldo le falta la versión del formato.' };
  if (r.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'El respaldo se hizo con una versión más nueva de la herramienta. Actualizá la página e intentá de nuevo.' };
  }
  if (!r.datos || typeof r.datos !== 'object' || Array.isArray(r.datos)) return { ok: false, error: 'El respaldo no contiene datos.' };
  const entradas = Object.entries(r.datos);
  if (entradas.length === 0) return { ok: false, error: 'El respaldo está vacío.' };
  for (const [k, v] of entradas) {
    if (!k.startsWith(PREFIJO) || typeof v !== 'string') return { ok: false, error: 'El respaldo tiene datos con un formato inesperado.' };
    try {
      JSON.parse(v);
    } catch {
      return { ok: false, error: 'El respaldo tiene datos dañados.' };
    }
  }
  return { ok: true, respaldo: r as Respaldo };
}

/** Reemplaza todo el progreso guardado por el del respaldo. */
export function restaurarRespaldo(r: Respaldo): void {
  for (const k of clavesGuardadas()) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(r.datos)) localStorage.setItem(k, v);
  aplicarMigraciones();
}
