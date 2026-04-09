import type { TareaGestion, DashboardFinancieroResultado, EvaluacionCEO } from '../types/fase3';

const KEYS = {
  tareas: 'directorio_ar:fase3:tareas',
  dashboard: 'directorio_ar:fase3:dashboard',
  evaluacionCEO: 'directorio_ar:fase3:evaluacion_ceo',
} as const;

function isBrowser(): boolean { return typeof window !== 'undefined'; }

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  try { localStorage.removeItem(key); } catch { }
}

export const storageFase3 = {
  getTareas: () => getItem<TareaGestion[]>(KEYS.tareas) ?? [],
  setTareas: (v: TareaGestion[]) => setItem(KEYS.tareas, v),
  getDashboard: () => getItem<DashboardFinancieroResultado>(KEYS.dashboard),
  setDashboard: (v: DashboardFinancieroResultado) => setItem(KEYS.dashboard, v),
  getEvaluacionCEO: () => getItem<EvaluacionCEO>(KEYS.evaluacionCEO),
  setEvaluacionCEO: (v: EvaluacionCEO) => setItem(KEYS.evaluacionCEO, v),
  clearFase3: () => Object.values(KEYS).forEach(removeItem),
};
