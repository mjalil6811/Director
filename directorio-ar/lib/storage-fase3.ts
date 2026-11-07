import type { TareaGestion, DashboardFinancieroResultado, EvaluacionCEO } from '../types/fase3';
import { getItem, setItem, removeItem } from './storage-core';

const KEYS = {
  tareas: 'directorio_ar:fase3:tareas',
  dashboard: 'directorio_ar:fase3:dashboard',
  evaluacionCEO: 'directorio_ar:fase3:evaluacion_ceo',
} as const;

export const storageFase3 = {
  getTareas: () => getItem<TareaGestion[]>(KEYS.tareas) ?? [],
  setTareas: (v: TareaGestion[]) => setItem(KEYS.tareas, v),
  getDashboard: () => getItem<DashboardFinancieroResultado>(KEYS.dashboard),
  setDashboard: (v: DashboardFinancieroResultado) => setItem(KEYS.dashboard, v),
  getEvaluacionCEO: () => getItem<EvaluacionCEO>(KEYS.evaluacionCEO),
  setEvaluacionCEO: (v: EvaluacionCEO) => setItem(KEYS.evaluacionCEO, v),
  clearFase3: () => Object.values(KEYS).forEach(removeItem),
};
