// Índice de preparación (0–100): integra los 5 módulos del diagnóstico.
// Solo cuenta las dimensiones con datos, así un diagnóstico parcial no se penaliza.
import type {
  Modulo1Resultado,
  Modulo2Resultado,
  Modulo3Resultado,
  Modulo4Diagnostico,
  Modulo5Resultado,
} from '../types';

export interface DimensionIndice {
  id: string;
  label: string;
  descripcion: string;
  score: number;       // 0–100
  nivel: string;
  icono: string;
  fuente: string;
  /** Módulo que alimenta la dimensión (1–5). */
  modulo: number;
  tieneDatos: boolean;
}

export interface IndicePreparacion {
  total: number;       // 0–100
  nivel: string;
  etiqueta: string;
  color: string;
  colorBg: string;
  dimensiones: DimensionIndice[];
  completadas: number; // cuántas dimensiones tienen data
}

export function calcularIndicePreparacion(
  m1: Modulo1Resultado | null,
  m2: Modulo2Resultado | null,
  m3: Modulo3Resultado | null,
  m4diag: Modulo4Diagnostico | null,
  m5: Modulo5Resultado | null,
): IndicePreparacion {
  const dims: DimensionIndice[] = [];
  let completadas = 0;

  // D1 — Necesidad de directorio (M1)
  // A mayor necesidad detectada y mayor complejidad, mayor madurez implícita
  const d1score = m1 ? Math.min(100, m1.porcentaje ?? 0) : 0;
  dims.push({
    id: 'necesidad',
    label: 'Complejidad organizacional',
    descripcion: 'Nivel de complejidad y madurez que justifica un directorio formal.',
    score: d1score,
    tieneDatos: !!m1,
    nivel: d1score >= 75 ? 'Alta' : d1score >= 50 ? 'Media-alta' : d1score >= 30 ? 'Media' : 'Baja',
    icono: '🏛',
    fuente: 'Módulo 1',
    modulo: 1,
  });
  if (m1) completadas++;

  // D2 — Distribución de decisiones (M2)
  // Más delegación = más madurez. Score invertido: menos concentración = mejor.
  const d2raw = m2 ? (m2.porcentaje ?? 0) : 0;
  const d2score = m2 ? Math.max(0, 100 - d2raw) : 0;
  dims.push({
    id: 'decisiones',
    label: 'Distribución de decisiones',
    descripcion: 'Grado en que las decisiones estratégicas están bien delegadas y no concentradas en una sola persona.',
    score: d2score,
    tieneDatos: !!m2,
    nivel: d2score >= 70 ? 'Saludable' : d2score >= 45 ? 'En desarrollo' : d2score >= 20 ? 'Concentrada' : 'Muy concentrada',
    icono: '⚖',
    fuente: 'Módulo 2',
    modulo: 2,
  });
  if (m2) completadas++;

  // D3 — Composición del directorio (M3)
  // Basado en la urgencia del perfil más crítico (indicador inverso de brechas)
  let d3score = 0;
  if (m3) {
    const topUrgencia = m3.topPerfiles[0]?.urgencia ?? '';
    if (topUrgencia === 'Crítico') d3score = 20;
    else if (topUrgencia === 'Urgente') d3score = 45;
    else d3score = 70;
  }
  dims.push({
    id: 'composicion',
    label: 'Composición y perfiles',
    descripcion: 'Adecuación de los perfiles existentes o planificados para las necesidades estratégicas de la empresa.',
    score: d3score,
    tieneDatos: !!m3,
    nivel: d3score >= 65 ? 'Adecuada' : d3score >= 40 ? 'Con brechas' : 'Crítica',
    icono: '👥',
    fuente: 'Módulo 3',
    modulo: 3,
  });
  if (m3) completadas++;

  // D4 — Disposición al cambio (M4)
  const d4score = m4diag ? (m4diag.porcentaje ?? 0) : 0;
  dims.push({
    id: 'disposicion',
    label: 'Disposición al cambio',
    descripcion: 'Voluntad real del CEO y de los dueños de decidir con el respaldo de un consejo asesor o directorio.',
    score: d4score,
    tieneDatos: !!m4diag,
    nivel: d4score >= 80 ? 'Alta' : d4score >= 50 ? 'Moderada' : 'Baja',
    icono: '🎯',
    fuente: 'Módulo 4',
    modulo: 4,
  });
  if (m4diag) completadas++;

  // D5 — Dinámica directorio-gerencia (M5)
  const d5score = m5 ? (m5.porcentaje ?? 0) : 0;
  dims.push({
    id: 'dinamica',
    label: 'Dinámica directorio-gerencia',
    descripcion: 'Calidad de la relación operativa entre el directorio y la gerencia: información, autonomía y evaluación mutua.',
    score: d5score,
    tieneDatos: !!m5,
    nivel: d5score >= 75 ? 'Sana' : d5score >= 50 ? 'En construcción' : d5score >= 25 ? 'Con tensiones' : 'Crítica',
    icono: '🔄',
    fuente: 'Módulo 5',
    modulo: 5,
  });
  if (m5) completadas++;

  // Score total ponderado
  // Pesos: necesidad 15%, decisiones 25%, composición 20%, disposición 20%, dinámica 20%
  const pesos = [0.15, 0.25, 0.20, 0.20, 0.20];
  const pesoCompletado = dims.reduce((acc, d, i) => acc + (d.tieneDatos ? pesos[i] : 0), 0);
  const totalPonderado = dims.reduce((acc, d, i) => acc + (d.tieneDatos ? d.score * pesos[i] : 0), 0);
  const ajuste = pesoCompletado > 0 ? totalPonderado / pesoCompletado : 0;
  const total = Math.round(Math.min(100, ajuste));

  let nivel: string;
  let etiqueta: string;
  let color: string;
  let colorBg: string;

  if (total >= 75) {
    nivel = 'Avanzado';
    etiqueta = 'Decisiones con respaldo sólido';
    color = '#0F6E56';
    colorBg = '#E1F5EE';
  } else if (total >= 55) {
    nivel = 'Intermedio';
    etiqueta = 'Forma de decidir en desarrollo';
    color = '#534AB7';
    colorBg = '#EEEDFE';
  } else if (total >= 35) {
    nivel = 'Inicial';
    etiqueta = 'Primeros pasos para decidir con respaldo';
    color = '#854F0B';
    colorBg = '#FAEEDA';
  } else {
    nivel = 'Incipiente';
    etiqueta = 'Decisiones todavía concentradas';
    color = '#A32D2D';
    colorBg = '#FCEBEB';
  }

  return { total, nivel, etiqueta, color, colorBg, dimensiones: dims, completadas };
}

export const ETIQUETA_CORTA: Record<string, string> = {
  necesidad: 'Complejidad',
  decisiones: 'Decisiones',
  composicion: 'Perfiles',
  disposicion: 'Disposición',
  dinamica: 'Dinámica',
};

// Referencias de mercado para la comparación (0–100)
export const BENCHMARKS = [
  { key: 'pyme', label: 'PyME familiar sin directorio', score: 18 },
  { key: 'advisory', label: 'PyME con consejo asesor', score: 38 },
  { key: 'mediana', label: 'Empresa mediana con directorio', score: 62 },
  { key: 'madura', label: 'Empresa con directorio consolidado', score: 84 },
];


/** Referencia que se dibuja en el radar: empresa mediana con directorio. */
export const REFERENCIA_RADAR = { valor: 62, label: 'Empresa mediana con directorio' };
