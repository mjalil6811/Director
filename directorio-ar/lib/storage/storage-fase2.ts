import type {
  ActaConstitutiva,
  ProtocoloResultado,
  TipoProtocolo,
  ClausulaProtocolo,
  Reunion,
  CandidatoDirector,
  ChecklistOnboarding,
} from '../../types/fase2';

const KEYS = {
  actaConstitutiva: 'directorio_ar:fase2:acta_constitutiva',
  protocoloTipo: 'directorio_ar:fase2:protocolo_tipo',
  protocoloClausulas: 'directorio_ar:fase2:protocolo_clausulas',
  protocoloResultado: 'directorio_ar:fase2:protocolo_resultado',
  reuniones: 'directorio_ar:fase2:reuniones',
  candidatos: 'directorio_ar:fase2:candidatos',
  checklistOnboarding: 'directorio_ar:fase2:checklist_onboarding',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
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
    // silent
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // silent
  }
}

export const storageFase2 = {
  // M6 — Acta constitutiva
  getActaConstitutiva: () => getItem<ActaConstitutiva>(KEYS.actaConstitutiva),
  setActaConstitutiva: (v: ActaConstitutiva) => setItem(KEYS.actaConstitutiva, v),

  // M7 — Protocolo
  getProtocoloTipo: () => getItem<TipoProtocolo>(KEYS.protocoloTipo),
  setProtocoloTipo: (v: TipoProtocolo) => setItem(KEYS.protocoloTipo, v),
  getProtocoloClausulas: () => getItem<ClausulaProtocolo[]>(KEYS.protocoloClausulas),
  setProtocoloClausulas: (v: ClausulaProtocolo[]) => setItem(KEYS.protocoloClausulas, v),
  getProtocoloResultado: () => getItem<ProtocoloResultado>(KEYS.protocoloResultado),
  setProtocoloResultado: (v: ProtocoloResultado) => setItem(KEYS.protocoloResultado, v),

  // M8 — Reuniones
  getReuniones: () => getItem<Reunion[]>(KEYS.reuniones) ?? [],
  setReuniones: (v: Reunion[]) => setItem(KEYS.reuniones, v),
  addReunion: (reunion: Reunion) => {
    const existentes = getItem<Reunion[]>(KEYS.reuniones) ?? [];
    setItem(KEYS.reuniones, [...existentes, reunion]);
  },
  updateReunion: (id: string, updates: Partial<Reunion>) => {
    const existentes = getItem<Reunion[]>(KEYS.reuniones) ?? [];
    setItem(KEYS.reuniones, existentes.map(r => r.id === id ? { ...r, ...updates } : r));
  },

  // M9 — Directores
  getCandidatos: () => getItem<CandidatoDirector[]>(KEYS.candidatos) ?? [],
  setCandidatos: (v: CandidatoDirector[]) => setItem(KEYS.candidatos, v),
  getChecklistOnboarding: () => getItem<ChecklistOnboarding[]>(KEYS.checklistOnboarding) ?? [],
  setChecklistOnboarding: (v: ChecklistOnboarding[]) => setItem(KEYS.checklistOnboarding, v),

  clearFase2: () => {
    Object.values(KEYS).forEach(removeItem);
  },
};
