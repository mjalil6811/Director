// Acceso seguro a localStorage, compartido por todos los stores (fase 1, 2, 3 y votaciones).
// Nunca lanza: devuelve null si no hay navegador, si el dato no existe o si el JSON es inválido.

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const val = localStorage.getItem(key);
    return val === null ? null : (JSON.parse(val) as T);
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // cuota llena o modo privado: se ignora
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignorar
  }
}

/** Id corto aleatorio para entidades guardadas localmente. */
export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}
