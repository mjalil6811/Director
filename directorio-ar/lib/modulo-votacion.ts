import type {
  Votacion, VotoDirector, TipoVoto, TipoMayoria,
  ResultadoVotacion, EstadoVotacion,
} from '../types/fase2';

// ——— ID ———————————————————————————————————————————————————————————————————

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ——— Metadatos de voto ————————————————————————————————————————————————————

export const VOTO_META: Record<TipoVoto, { label: string; color: string; bg: string; icono: string }> = {
  a_favor:    { label: 'A favor',     color: '#085041', bg: '#E1F5EE', icono: '✓' },
  en_contra:  { label: 'En contra',   color: '#A32D2D', bg: '#FCEBEB', icono: '✗' },
  abstencion: { label: 'Abstención',  color: '#633806', bg: '#FAEEDA', icono: '—' },
  ausente:    { label: 'Ausente',     color: '#5F5E5A', bg: '#F1EFE8', icono: '·' },
};

export const MAYORIA_META: Record<TipoMayoria, { label: string; descripcion: string; umbral: number }> = {
  simple:        { label: 'Mayoría simple',        descripcion: 'Más del 50% de los votos emitidos', umbral: 0.5 },
  calificada_2_3: { label: 'Mayoría calificada (2/3)', descripcion: 'Al menos dos tercios de los votos emitidos', umbral: 0.667 },
  unanimidad:    { label: 'Unanimidad',            descripcion: 'Todos los directores deben votar a favor', umbral: 1 },
};

// ——— Calcular resultado ——————————————————————————————————————————————————

export function calcularResultado(
  votacion: Votacion,
  totalDirectores: number,
): ResultadoVotacion {
  const votos = votacion.votos;
  const aFavor    = votos.filter(v => v.voto === 'a_favor').length;
  const enContra  = votos.filter(v => v.voto === 'en_contra').length;
  const abstenciones = votos.filter(v => v.voto === 'abstencion').length;
  const ausentes  = votos.filter(v => v.voto === 'ausente').length;

  const votantesEfectivos = aFavor + enContra;
  const totalVotantes = votos.length || totalDirectores;

  const presentes = totalVotantes - ausentes;
  const quorumAlcanzado = votacion.requiereQuorum
    ? presentes / totalDirectores * 100 >= votacion.quorumMinimo
    : true;

  const umbral = MAYORIA_META[votacion.tipoMayoria].umbral;
  let aprobada = false;

  if (votacion.tipoMayoria === 'unanimidad') {
    aprobada = aFavor === totalVotantes && enContra === 0 && abstenciones === 0;
  } else if (votantesEfectivos > 0) {
    aprobada = aFavor / votantesEfectivos > umbral;
  }

  aprobada = aprobada && quorumAlcanzado;

  const porcentajeAFavor = votantesEfectivos > 0
    ? Math.round(aFavor / votantesEfectivos * 100)
    : 0;

  let resumen = aprobada ? 'APROBADA' : 'RECHAZADA';
  resumen += ` — ${aFavor} a favor`;
  if (enContra > 0) resumen += `, ${enContra} en contra`;
  if (abstenciones > 0) resumen += `, ${abstenciones} abstención${abstenciones > 1 ? 'es' : ''}`;
  if (ausentes > 0) resumen += `, ${ausentes} ausente${ausentes > 1 ? 's' : ''}`;
  if (!quorumAlcanzado) resumen += ' (sin quórum)';

  return { aprobada, aFavor, enContra, abstenciones, ausentes, totalVotantes, porcentajeAFavor, quorumAlcanzado, resumen };
}

// ——— Crear votación nueva ————————————————————————————————————————————————

export function crearVotacion(
  reunionId: string,
  titulo: string,
  descripcion: string,
  tipoMayoria: TipoMayoria,
  itemReunionId?: string,
  quorumMinimo: number = 50,
): Votacion {
  return {
    id: generarId(),
    reunionId,
    itemReunionId,
    titulo,
    descripcion,
    tipoMayoria,
    estado: 'pendiente',
    votos: [],
    requiereQuorum: true,
    quorumMinimo,
  };
}

// ——— Abrir / cerrar votación —————————————————————————————————————————————

export function abrirVotacion(v: Votacion): Votacion {
  return { ...v, estado: 'abierta', fechaApertura: new Date().toISOString() };
}

export function cerrarVotacion(v: Votacion, totalDirectores: number): Votacion {
  const resultado = calcularResultado(v, totalDirectores);
  return { ...v, estado: 'cerrada', fechaCierre: new Date().toISOString(), resultado };
}

// ——— Registrar voto ——————————————————————————————————————————————————————

export function registrarVoto(
  votacion: Votacion,
  directorNombre: string,
  voto: TipoVoto,
  comentario?: string,
): Votacion {
  const sinEste = votacion.votos.filter(v => v.directorNombre !== directorNombre);
  const nuevoVoto: VotoDirector = {
    directorNombre,
    voto,
    comentario,
    fechaHora: new Date().toISOString(),
  };
  return { ...votacion, votos: [...sinEste, nuevoVoto] };
}

// ——— Generar texto para el acta ——————————————————————————————————————————

export function generarTextoVotacion(v: Votacion): string {
  if (!v.resultado) return '';
  const meta = MAYORIA_META[v.tipoMayoria];
  const hora = v.fechaCierre
    ? new Date(v.fechaCierre).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return `VOTACIÓN: ${v.titulo.toUpperCase()}
${v.descripcion}
Tipo de mayoría requerida: ${meta.label} (${meta.descripcion})
Hora de cierre: ${hora} hs.

Resultado: ${v.resultado.resumen}
${v.votos.map(vt => `  ${vt.directorNombre}: ${VOTO_META[vt.voto].label}${vt.comentario ? ` — "${vt.comentario}"` : ''}`).join('\n')}
`;
}

// ——— Storage de votaciones ———————————————————————————————————————————————

const VOTACIONES_KEY = 'directorio_ar:fase2:votaciones';

function isBrowser(): boolean { return typeof window !== 'undefined'; }

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

export const storageVotaciones = {
  getVotaciones: (): Votacion[] => getItem<Votacion[]>(VOTACIONES_KEY) ?? [],
  setVotaciones: (v: Votacion[]) => setItem(VOTACIONES_KEY, v),
  getVotacionesPorReunion: (reunionId: string): Votacion[] =>
    (getItem<Votacion[]>(VOTACIONES_KEY) ?? []).filter(v => v.reunionId === reunionId),
  addVotacion: (v: Votacion) => {
    const todas = getItem<Votacion[]>(VOTACIONES_KEY) ?? [];
    setItem(VOTACIONES_KEY, [...todas, v]);
  },
  updateVotacion: (id: string, updates: Partial<Votacion>) => {
    const todas = getItem<Votacion[]>(VOTACIONES_KEY) ?? [];
    setItem(VOTACIONES_KEY, todas.map(v => v.id === id ? { ...v, ...updates } : v));
  },
};
