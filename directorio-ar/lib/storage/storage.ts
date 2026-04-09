import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico, Modulo5Resultado } from "../../types";

const KEYS = {
  modulo1Respuestas: "directorio_ar:modulo1:respuestas",
  modulo1Resultado: "directorio_ar:modulo1:resultado",
  modulo2Respuestas: "directorio_ar:modulo2:respuestas",
  modulo2Resultado: "directorio_ar:modulo2:resultado",
  modulo3Respuestas: "directorio_ar:modulo3:respuestas",
  modulo3Resultado: "directorio_ar:modulo3:resultado",
  modulo4Frecuencia: "directorio_ar:modulo4:frecuencia",
  modulo4Diagnostico: "directorio_ar:modulo4:diagnostico",
  modulo5Respuestas: "directorio_ar:modulo5:respuestas",
  modulo5Resultado: "directorio_ar:modulo5:resultado",
  empresaNombre: "directorio_ar:empresa:nombre",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return null;
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const storage = {
  getModulo1Respuestas: () => getItem<number[]>(KEYS.modulo1Respuestas),
  setModulo1Respuestas: (v: number[]) => setItem(KEYS.modulo1Respuestas, v),
  getModulo1Resultado: () => getItem<Modulo1Resultado>(KEYS.modulo1Resultado),
  setModulo1Resultado: (v: Modulo1Resultado) => setItem(KEYS.modulo1Resultado, v),

  getModulo2Respuestas: () => getItem<number[]>(KEYS.modulo2Respuestas),
  setModulo2Respuestas: (v: number[]) => setItem(KEYS.modulo2Respuestas, v),
  getModulo2Resultado: () => getItem<Modulo2Resultado>(KEYS.modulo2Resultado),
  setModulo2Resultado: (v: Modulo2Resultado) => setItem(KEYS.modulo2Resultado, v),

  getModulo3Respuestas: () => getItem<number[]>(KEYS.modulo3Respuestas),
  setModulo3Respuestas: (v: number[]) => setItem(KEYS.modulo3Respuestas, v),
  getModulo3Resultado: () => getItem<Modulo3Resultado>(KEYS.modulo3Resultado),
  setModulo3Resultado: (v: Modulo3Resultado) => setItem(KEYS.modulo3Resultado, v),

  getModulo4Frecuencia: () => getItem<string>(KEYS.modulo4Frecuencia),
  setModulo4Frecuencia: (v: string) => setItem(KEYS.modulo4Frecuencia, v),
  getModulo4Diagnostico: () => getItem<Modulo4Diagnostico>(KEYS.modulo4Diagnostico),
  setModulo4Diagnostico: (v: Modulo4Diagnostico) => setItem(KEYS.modulo4Diagnostico, v),

  getModulo5Respuestas: () => getItem<(1 | 0.5 | 0)[]>(KEYS.modulo5Respuestas),
  setModulo5Respuestas: (v: (1 | 0.5 | 0)[]) => setItem(KEYS.modulo5Respuestas, v),
  getModulo5Resultado: () => getItem<Modulo5Resultado>(KEYS.modulo5Resultado),
  setModulo5Resultado: (v: Modulo5Resultado) => setItem(KEYS.modulo5Resultado, v),

  getEmpresaNombre: () => getItem<string>(KEYS.empresaNombre),
  setEmpresaNombre: (v: string) => setItem(KEYS.empresaNombre, v),

  clearAll: () => {
    Object.values(KEYS).forEach(removeItem);
  },
};
