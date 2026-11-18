// Resultado principal del diagnóstico: dos ejes y una matriz 2×2.
//
// - Necesidad (0–100): cuánto necesita la empresa un consejo.
//     50% Módulo 1 (sin la pregunta de presupuesto) · 30% concentración de decisiones (M2) · 20% brecha de perfiles (M3)
// - Disposición (0–100): cuánta voluntad hay de trabajar con un consejo.
//     50% Módulo 4 · 30% acuerdo de trabajo (M5) · 20% presupuesto (pregunta del M1)
// Solo se promedian los módulos respondidos (los pesos se reescalan). Corte de la matriz: 50.
//
// El Índice de preparación (lib/indice.ts) se mantiene como dato secundario.
import type { Modulo1Resultado, Modulo2Resultado, Modulo3Resultado, Modulo4Diagnostico, Modulo5Resultado } from '../types';

export const CORTE = 50;

export type CuadranteKey = 'armar' | 'sin_acuerdo' | 'anticipada' | 'todavia_no';

export const CUADRANTES: Record<CuadranteKey, { titulo: string; resumen: string; proximoPaso: string; color: string; bg: string }> = {
  armar: {
    titulo: 'Momento de armarlo',
    resumen: 'La empresa necesita un consejo y hay disposición para trabajar con él.',
    proximoPaso: 'Convocá la primera reunión del consejo en los próximos 90 días, con 2 o 3 asesores y una lista de decisiones acordada.',
    color: '#0F6E56', bg: '#E1F5EE',
  },
  sin_acuerdo: {
    titulo: 'Necesidad sin acuerdo',
    resumen: 'La empresa necesita un consejo, pero todavía no hay disposición suficiente para trabajar con él.',
    proximoPaso: 'Empezá con un consejo asesor informal durante 6 meses: uno o dos asesores de confianza, reuniones bimestrales y sin poder de veto.',
    color: '#B42318', bg: '#FCEBEB',
  },
  anticipada: {
    titulo: 'Preparación anticipada',
    resumen: 'Todavía no hay una necesidad fuerte, y sí disposición: es un buen momento para preparar el terreno.',
    proximoPaso: 'Sumá 1 o 2 asesores externos y ordená un informe financiero mensual antes de formalizar un consejo.',
    color: '#534AB7', bg: '#EEEDFE',
  },
  todavia_no: {
    titulo: 'Todavía no',
    resumen: 'Por ahora ni la necesidad ni la disposición justifican un consejo.',
    proximoPaso: 'Volvé a hacer el diagnóstico en 12 meses, o antes si cambia algo importante: socios, tamaño o sucesión.',
    color: '#4B5563', bg: '#F3F4F6',
  },
};

export type Ejes = {
  necesidad: number | null;
  disposicion: number | null;
  cuadrante: CuadranteKey | null;
  /** true si la disposición sale solo de la pregunta de presupuesto (sin M4 ni M5). */
  disposicionPreliminar: boolean;
};

/** Brecha de perfiles según la urgencia del perfil más necesario (mismo criterio que el índice, invertido). */
const BRECHA_M3: Record<string, number> = { 'Crítico': 80, 'Urgente': 55, 'Recomendado': 30, 'Complementario': 30 };

function promedio(partes: [number | null | undefined, number][]): number | null {
  const con = partes.filter((p): p is [number, number] => typeof p[0] === 'number');
  const peso = con.reduce((a, [, w]) => a + w, 0);
  if (peso === 0) return null;
  return Math.round(con.reduce((a, [v, w]) => a + v * w, 0) / peso);
}

export function cuadranteDe(necesidad: number, disposicion: number): CuadranteKey {
  const n = necesidad >= CORTE;
  const d = disposicion >= CORTE;
  return n && d ? 'armar' : n ? 'sin_acuerdo' : d ? 'anticipada' : 'todavia_no';
}

export function calcularEjes(
  m1: Modulo1Resultado | null,
  m2: Modulo2Resultado | null,
  m3: Modulo3Resultado | null,
  m4: Modulo4Diagnostico | null,
  m5: Modulo5Resultado | null,
): Ejes {
  const presupuesto = m1?.scoresPorDimension.find(d => d.key === 'disponibilidad');
  const presupuestoPct = presupuesto && presupuesto.max > 0 ? Math.round((presupuesto.score / presupuesto.max) * 100) : null;
  const urgencia = m3?.topPerfiles?.[0]?.urgencia;

  const necesidad = promedio([
    [m1?.porcentaje, 0.5],
    [m2?.porcentaje, 0.3],
    [urgencia ? BRECHA_M3[urgencia] ?? 30 : null, 0.2],
  ]);
  const disposicion = promedio([
    [m4?.porcentaje, 0.5],
    [m5?.porcentaje, 0.3],
    [presupuestoPct, 0.2],
  ]);

  return {
    necesidad,
    disposicion,
    cuadrante: necesidad !== null && disposicion !== null ? cuadranteDe(necesidad, disposicion) : null,
    disposicionPreliminar: !m4 && !m5,
  };
}
