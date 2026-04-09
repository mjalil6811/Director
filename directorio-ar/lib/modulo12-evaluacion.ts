import type { DimensionEvaluacion, EvaluacionCEO, EvaluacionDirector, RespuestaEvaluacion } from '../types/fase3';

export function generarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const DIMENSIONES_EVALUACION: DimensionEvaluacion[] = [
  {
    id: 'estrategia',
    nombre: 'Visión y estrategia',
    descripcion: 'Capacidad del CEO de definir, comunicar y ejecutar la dirección estratégica de la empresa.',
    preguntas: [
      { id: 'e1', texto: '¿El CEO tiene una visión clara y bien articulada del futuro de la empresa?', tipo: 'escala' },
      { id: 'e2', texto: '¿El CEO adapta la estrategia frente a cambios del mercado con agilidad?', tipo: 'escala' },
      { id: 'e3', texto: '¿El CEO alinea al equipo gerencial detrás de los objetivos estratégicos?', tipo: 'escala' },
    ],
  },
  {
    id: 'ejecucion',
    nombre: 'Ejecución y resultados',
    descripcion: 'Logro de los objetivos financieros y operativos comprometidos ante el directorio.',
    preguntas: [
      { id: 'ej1', texto: '¿El CEO cumple con los compromisos financieros establecidos en el presupuesto?', tipo: 'escala' },
      { id: 'ej2', texto: '¿El CEO implementa las decisiones del directorio con eficacia y en los plazos acordados?', tipo: 'escala' },
      { id: 'ej3', texto: '¿El CEO gestiona bien los recursos de la empresa (capital, talento, tiempo)?', tipo: 'escala' },
    ],
  },
  {
    id: 'liderazgo',
    nombre: 'Liderazgo y equipo',
    descripcion: 'Capacidad de construir y desarrollar el equipo gerencial y la cultura organizacional.',
    preguntas: [
      { id: 'l1', texto: '¿El CEO construye y retiene un equipo gerencial de alta calidad?', tipo: 'escala' },
      { id: 'l2', texto: '¿El CEO delega apropiadamente y desarrolla capacidades en su equipo?', tipo: 'escala' },
      { id: 'l3', texto: '¿El CEO promueve una cultura organizacional sana y de alto desempeño?', tipo: 'escala' },
    ],
  },
  {
    id: 'gobierno',
    nombre: 'Relación con el directorio',
    descripcion: 'Calidad de la información que comparte, transparencia y respeto por la autoridad del board.',
    preguntas: [
      { id: 'g1', texto: '¿El CEO informa al directorio oportunamente, incluyendo malas noticias?', tipo: 'escala' },
      { id: 'g2', texto: '¿El CEO respeta las decisiones del directorio aunque no esté de acuerdo?', tipo: 'escala' },
      { id: 'g3', texto: '¿El CEO utiliza al directorio como un recurso estratégico real?', tipo: 'escala' },
    ],
  },
  {
    id: 'integridad',
    nombre: 'Integridad y valores',
    descripcion: 'Comportamiento ético, transparente y consistente con los valores de la empresa.',
    preguntas: [
      { id: 'i1', texto: '¿El CEO actúa con integridad y da el ejemplo en materia de valores?', tipo: 'escala' },
      { id: 'i2', texto: '¿El CEO gestiona los conflictos de interés de forma transparente?', tipo: 'escala' },
    ],
  },
  {
    id: 'desarrollo',
    nombre: 'Desarrollo personal',
    descripcion: 'Voluntad de aprendizaje, autocrítica y desarrollo profesional continuo.',
    preguntas: [
      { id: 'd1', texto: '¿El CEO es receptivo al feedback y trabaja activamente en sus áreas de mejora?', tipo: 'escala' },
      { id: 'd2', texto: '¿El CEO invierte en su propio desarrollo profesional y en mantenerse actualizado?', tipo: 'escala' },
    ],
  },
];

export const ESCALA_LABELS: Record<number, string> = {
  1: 'Muy bajo', 2: 'Bajo', 3: 'Moderado', 4: 'Alto', 5: 'Muy alto',
};

export const ESCALA_COLORES: Record<number, string> = {
  1: '#A32D2D', 2: '#854F0B', 3: '#633806', 4: '#085041', 5: '#3B6D11',
};

export function calcularScoreDimension(
  dimensionId: string,
  evaluaciones: EvaluacionDirector[],
): number {
  const dimension = DIMENSIONES_EVALUACION.find(d => d.id === dimensionId);
  if (!dimension) return 0;
  const preguntaIds = dimension.preguntas.map(p => p.id);
  const valores: number[] = [];
  for (const ev of evaluaciones.filter(e => e.completada)) {
    for (const resp of ev.respuestas) {
      if (preguntaIds.includes(resp.preguntaId) && typeof resp.valor === 'number') {
        valores.push(resp.valor);
      }
    }
  }
  if (valores.length === 0) return 0;
  return Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 10) / 10;
}

export function calcularEvaluacion(evaluacion: EvaluacionCEO): EvaluacionCEO {
  const evaluacionesCompletas = evaluacion.evaluaciones.filter(e => e.completada);
  if (evaluacionesCompletas.length === 0) return evaluacion;

  const scoresPorDimension = DIMENSIONES_EVALUACION.map(d => ({
    dimensionId: d.id,
    nombre: d.nombre,
    promedio: calcularScoreDimension(d.id, evaluacion.evaluaciones),
  }));

  const scoresValidos = scoresPorDimension.filter(s => s.promedio > 0);
  const scorePromedio = scoresValidos.length > 0
    ? Math.round((scoresValidos.reduce((s, d) => s + d.promedio, 0) / scoresValidos.length) * 10) / 10
    : 0;

  const fortalezas = scoresPorDimension.filter(s => s.promedio >= 4).map(s => s.nombre);
  const areasDesarrollo = scoresPorDimension.filter(s => s.promedio > 0 && s.promedio < 3).map(s => s.nombre);

  return { ...evaluacion, scorePromedio, scoresPorDimension, fortalezas, areasDesarrollo };
}

export function generarInformeEvaluacion(evaluacion: EvaluacionCEO, empresaNombre: string): string {
  const calc = calcularEvaluacion(evaluacion);
  const niveles = ['', 'Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto'];
  const nivelGlobal = calc.scorePromedio >= 4.5 ? 'Muy alto' :
    calc.scorePromedio >= 3.5 ? 'Alto' :
    calc.scorePromedio >= 2.5 ? 'Moderado' :
    calc.scorePromedio >= 1.5 ? 'Bajo' : 'Muy bajo';

  return `EVALUACIÓN ANUAL DEL CEO
${empresaNombre.toUpperCase()} — Año ${evaluacion.anio}
CEO evaluado: ${evaluacion.ceoNombre}
Directores que respondieron: ${evaluacion.evaluaciones.filter(e => e.completada).length}

———————————————————————————————————
SCORE GLOBAL: ${calc.scorePromedio}/5 — ${nivelGlobal}
———————————————————————————————————

RESULTADOS POR DIMENSIÓN
${calc.scoresPorDimension.filter(s => s.promedio > 0).map(s => `${s.nombre.padEnd(28)} ${s.promedio}/5 — ${niveles[Math.round(s.promedio)]}`).join('\n')}

${calc.fortalezas.length > 0 ? `FORTALEZAS IDENTIFICADAS\n${calc.fortalezas.map(f => `+ ${f}`).join('\n')}\n` : ''}
${calc.areasDesarrollo.length > 0 ? `ÁREAS DE DESARROLLO\n${calc.areasDesarrollo.map(a => `‣ ${a}`).join('\n')}\n` : ''}
———————————————————————————————————
CONFIDENCIALIDAD
———————————————————————————————————
Este informe es confidencial y está destinado exclusivamente al Presidente del Directorio.
Las respuestas individuales son anónimas.

Generado por Directorio AR — ${new Date().toLocaleDateString('es-AR')}
`;
}
