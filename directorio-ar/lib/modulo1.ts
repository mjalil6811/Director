import type { Modulo1Resultado } from "../types";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Opcion = { texto: string; puntaje: 0 | 1 | 2 | 3 };
export type Pregunta = { numero: number; texto: string; aclaracion: string; opciones: [Opcion, Opcion, Opcion, Opcion] };
export type Dimension = { nombre: string; key: string; preguntas: Pregunta[] };

// ─── Dimensiones y preguntas ───────────────────────────────────────────────────

export const DIMENSIONES: Dimension[] = [
  {
    nombre: "Tamaño y complejidad",
    key: "tamano",
    preguntas: [
      {
        numero: 1,
        texto: "¿Cuántas personas trabajan en la empresa?",
        aclaracion: "Incluí empleados en relación de dependencia y colaboradores estables.",
        opciones: [
          { texto: "Menos de 10 personas", puntaje: 0 },
          { texto: "Entre 10 y 30 personas", puntaje: 1 },
          { texto: "Entre 30 y 100 personas", puntaje: 2 },
          { texto: "Más de 100 personas", puntaje: 3 },
        ],
      },
      {
        numero: 2,
        texto: "¿Cuál es la facturación anual aproximada de la empresa?",
        aclaracion: "En pesos constantes actuales.",
        opciones: [
          { texto: "Menos de $50 millones", puntaje: 0 },
          { texto: "Entre $50 y $200 millones", puntaje: 1 },
          { texto: "Entre $200 millones y $1.000 millones", puntaje: 2 },
          { texto: "Más de $1.000 millones", puntaje: 3 },
        ],
      },
    ],
  },
  {
    nombre: "Estructura de propiedad",
    key: "propiedad",
    preguntas: [
      {
        numero: 3,
        texto: "¿Cómo está distribuida la propiedad de la empresa?",
        aclaracion: "La composición accionaria es uno de los factores más determinantes para la necesidad de un directorio.",
        opciones: [
          { texto: "Un solo dueño, sin socios", puntaje: 0 },
          { texto: "Dos o tres socios fundadores", puntaje: 1 },
          { texto: "Familia ampliada o segunda generación involucrada", puntaje: 2 },
          { texto: "Múltiples socios, incluyendo inversores o fondos", puntaje: 3 },
        ],
      },
      {
        numero: 4,
        texto: "¿Existe o existirá en los próximos 3 años algún proceso de sucesión o cambio de control?",
        aclaracion: "Venta parcial, incorporación de nuevos socios, traspaso generacional, ingreso de inversores.",
        opciones: [
          { texto: "No está previsto ningún cambio", puntaje: 0 },
          { texto: "Hay conversaciones pero nada concreto", puntaje: 1 },
          { texto: "Está en proceso o muy próximo", puntaje: 2 },
          { texto: "Ya ocurrió y hay tensiones no resueltas", puntaje: 3 },
        ],
      },
    ],
  },
  {
    nombre: "Gobierno actual",
    key: "gobierno",
    preguntas: [
      {
        numero: 5,
        texto: "¿Cómo se toman hoy las decisiones estratégicas importantes en la empresa?",
        aclaracion: "Expansión, deuda significativa, nuevos socios, cambios en la dirección.",
        opciones: [
          { texto: "Las toma el dueño o CEO solo", puntaje: 0 },
          { texto: "Se discuten entre los socios informalmente", puntaje: 1 },
          { texto: "Hay reuniones periódicas pero sin estructura formal", puntaje: 2 },
          { texto: "Existe algún órgano de gobierno aunque sea informal", puntaje: 3 },
        ],
      },
      {
        numero: 6,
        texto: "¿Existe hoy alguna diferencia real entre quién es dueño y quién gerencia la empresa?",
        aclaracion: "En muchas PyMEs argentinas los dueños son también los gerentes.",
        opciones: [
          { texto: "Los dueños operan el día a día completamente", puntaje: 0 },
          { texto: "Hay gerentes pero los dueños deciden todo", puntaje: 1 },
          { texto: "Hay gerentes con algo de autonomía real", puntaje: 2 },
          { texto: "La gerencia opera con independencia clara de la propiedad", puntaje: 3 },
        ],
      },
    ],
  },
  {
    nombre: "Toma de decisiones",
    key: "decisiones",
    preguntas: [
      {
        numero: 7,
        texto: "Cuando surge una decisión importante que no estaba prevista, ¿cómo se resuelve habitualmente?",
        aclaracion: "Pensá en las últimas 3 decisiones relevantes que tomó la empresa.",
        opciones: [
          { texto: "El dueño decide solo en el momento, sin consultar a nadie", puntaje: 0 },
          { texto: "Se consulta informalmente con algún socio o persona de confianza", puntaje: 1 },
          { texto: "Se posterga hasta poder reunir a las personas clave", puntaje: 2 },
          { texto: "Hay un proceso definido para este tipo de situaciones", puntaje: 3 },
        ],
      },
      {
        numero: 8,
        texto: "¿Quién tiene hoy la última palabra en una decisión que afecte el futuro de la empresa?",
        aclaracion: "No la respuesta formal o deseada — la que refleja lo que realmente pasa.",
        opciones: [
          { texto: "Una sola persona, siempre la misma", puntaje: 0 },
          { texto: "Depende del tema, pero siempre es informal", puntaje: 1 },
          { texto: "Un grupo de socios o referentes, aunque sin estructura", puntaje: 2 },
          { texto: "Hay criterios y roles definidos para distintos tipos de decisión", puntaje: 3 },
        ],
      },
      {
        numero: 9,
        texto: "¿Con qué frecuencia los socios o líderes se reúnen formalmente para revisar el rumbo del negocio?",
        aclaracion: "No las reuniones operativas del día a día — las conversaciones sobre estrategia y futuro.",
        opciones: [
          { texto: "Casi nunca o solo cuando hay una crisis", puntaje: 0 },
          { texto: "Una o dos veces al año, sin agenda estructurada", puntaje: 1 },
          { texto: "Trimestralmente, con algún orden pero sin formato fijo", puntaje: 2 },
          { texto: "Mensual o bimestralmente, con agenda y seguimiento de acuerdos", puntaje: 3 },
        ],
      },
    ],
  },
  {
    nombre: "Motivación para el directorio",
    key: "motivacion",
    preguntas: [
      {
        numero: 10,
        texto: "¿Cuál es la razón principal por la que estás considerando armar un directorio?",
        aclaracion: "Elegí la que más se acerca a tu situación real — no la que suena mejor.",
        opciones: [
          { texto: "Me lo pidió un banco, inversor o socio externo", puntaje: 0 },
          { texto: "Quiero ordenar la empresa antes de crecer o vender", puntaje: 1 },
          { texto: "Tuvimos un problema serio y necesitamos más control", puntaje: 2 },
          { texto: "Creo que es el momento de profesionalizar el gobierno", puntaje: 3 },
        ],
      },
      {
        numero: 11,
        texto: "¿Qué esperás que te aporte concretamente un directorio que hoy no tenés?",
        aclaracion: "Pensá en lo que más te preocupa o te falta en la conducción de la empresa.",
        opciones: [
          { texto: "Una perspectiva externa que cuestione mis decisiones", puntaje: 0 },
          { texto: "Control y orden en la toma de decisiones entre socios", puntaje: 1 },
          { texto: "Red de contactos y acceso a oportunidades", puntaje: 2 },
          { texto: "Estructura para poder delegar y salir de la operación", puntaje: 3 },
        ],
      },
    ],
  },
  {
    nombre: "Disponibilidad y compromiso",
    key: "disponibilidad",
    preguntas: [
      {
        numero: 12,
        texto: "¿Podrías comprometerte a reunirte con el directorio fuera de la oficina durante 2 horas, al menos una vez por mes?",
        aclaracion: "Hablamos de reuniones que no pueden postergarse por la operación del día a día.",
        opciones: [
          { texto: "Hoy sería muy difícil, mi agenda no lo permite", puntaje: 0 },
          { texto: "Podría hacerlo pero con mucho esfuerzo y reorganización", puntaje: 1 },
          { texto: "Sí, si está agendado con anticipación suficiente", puntaje: 2 },
          { texto: "Sin problema, ya reservo tiempo para pensar en el negocio", puntaje: 3 },
        ],
      },
      {
        numero: 13,
        texto: "¿Estarías dispuesto/a a preparar y leer información del negocio antes de cada reunión de directorio?",
        aclaracion: "Cada reunión requiere que los directores lleguen habiendo leído los informes enviados por la gerencia.",
        opciones: [
          { texto: "Difícilmente, no suelo tener tiempo para eso", puntaje: 0 },
          { texto: "Depende del volumen, pero haría el esfuerzo", puntaje: 1 },
          { texto: "Sí, si el material es concreto y no muy extenso", puntaje: 2 },
          { texto: "Ya lo hago o lo haría con facilidad", puntaje: 3 },
        ],
      },
      {
        numero: 14,
        texto: "¿La empresa o sus socios estarían dispuestos a destinar un presupuesto real para el funcionamiento del directorio?",
        aclaracion: "Incluye honorarios de directores independientes, lugar de reunión y materiales.",
        opciones: [
          { texto: "No está en el presupuesto y sería difícil incorporarlo", puntaje: 0 },
          { texto: "Podríamos destinar algo pequeño como primera instancia", puntaje: 1 },
          { texto: "Sí, si el valor aportado lo justifica claramente", puntaje: 2 },
          { texto: "Ya contemplamos este costo o no sería un obstáculo", puntaje: 3 },
        ],
      },
      {
        numero: 15,
        texto: "¿Cuánto tiempo lleva la empresa operando con su estructura actual de conducción?",
        aclaracion: "Esto nos ayuda a entender si el directorio sería una evolución natural o un cambio disruptivo.",
        opciones: [
          { texto: "Menos de 3 años — somos relativamente nuevos", puntaje: 0 },
          { texto: "Entre 3 y 8 años — estamos en etapa de consolidación", puntaje: 1 },
          { texto: "Entre 8 y 20 años — empresa establecida con historia", puntaje: 2 },
          { texto: "Más de 20 años — empresa madura con cultura arraigada", puntaje: 3 },
        ],
      },
    ],
  },
];

// Flat list for easy indexed access in the UI
export const PREGUNTAS_M1 = DIMENSIONES.flatMap(d => d.preguntas);
export const TOTAL_PREGUNTAS = PREGUNTAS_M1.length; // 15
export const PUNTAJE_MAXIMO = TOTAL_PREGUNTAS * 3;  // 45

// ─── Niveles ───────────────────────────────────────────────────────────────────

export const NIVELES = {
  prematuro:  { label: "Directorio prematuro",    descripcion: "La empresa aún no reúne las condiciones para que un directorio agregue valor real. Hay etapas previas a resolver.",                                                                        color: "#3B6D11", bgColor: "#EAF3DE" },
  temprano:   { label: "Señales tempranas",        descripcion: "Existen indicadores que justifican pensar en gobierno formal, pero el timing depende de cómo evolucionen ciertos factores clave.",                                                         color: "#854F0B", bgColor: "#FAEEDA" },
  transicion: { label: "Momento de transición",   descripcion: "La empresa está en un punto de inflexión. Armar un directorio en los próximos 12–18 meses sería estratégicamente oportuno.",                                                               color: "#185FA5", bgColor: "#E6F1FB" },
  urgente:    { label: "Necesidad urgente",        descripcion: "La empresa tiene múltiples factores que hacen que operar sin un directorio sea un riesgo real. El proceso debería iniciarse cuanto antes.",                                                color: "#993C1D", bgColor: "#FAECE7" },
} as const;

export type NivelKey = keyof typeof NIVELES;

export function calcularNivel(porcentaje: number): NivelKey {
  if (porcentaje < 30) return "prematuro";
  if (porcentaje < 55) return "temprano";
  if (porcentaje < 75) return "transicion";
  return "urgente";
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

// respuestas: number[] indexed 0–14 (option index chosen for each question)
export function calcularModulo1(respuestas: number[]): Modulo1Resultado {
  const scoresDim = DIMENSIONES.map(dim => {
    const score = dim.preguntas.reduce((acc, p) => {
      const globalIdx = PREGUNTAS_M1.findIndex(q => q.numero === p.numero);
      const opcionIdx = respuestas[globalIdx];
      if (opcionIdx === undefined || opcionIdx < 0) return acc;
      return acc + p.opciones[opcionIdx].puntaje;
    }, 0);
    const max = dim.preguntas.length * 3;
    return { key: dim.key, nombre: dim.nombre, score, max, porcentaje: Math.round((score / max) * 100) };
  });

  const scoreTotal = scoresDim.reduce((a, d) => a + d.score, 0);
  const porcentaje = Math.round((scoreTotal / PUNTAJE_MAXIMO) * 100);
  const nivelKey = calcularNivel(porcentaje);
  const nivel = NIVELES[nivelKey].label;

  // Recomendaciones
  const get = (key: string) => scoresDim.find(s => s.key === key);
  const recs: string[] = [];

  if ((get("propiedad")?.porcentaje ?? 0) >= 60)
    recs.push("La estructura de propiedad es compleja: formalizar quién decide qué y en qué calidad es una prioridad antes de armar el directorio.");
  if ((get("gobierno")?.porcentaje ?? 100) <= 33)
    recs.push("El gobierno actual es muy informal. Un primer paso puede ser instaurar reuniones mensuales de socios con agenda estructurada.");
  if ((get("decisiones")?.porcentaje ?? 100) <= 33)
    recs.push("Las decisiones hoy dependen de una sola persona o del azar. El directorio no puede funcionar bien sobre esa base — hay que construir el hábito de decidir en equipo primero.");
  if ((get("disponibilidad")?.porcentaje ?? 100) <= 33)
    recs.push("La disponibilidad y el presupuesto son limitados. Un directorio mal financiado o que no puede reunirse regularmente se convierte rápidamente en una formalidad vacía.");
  if ((get("tamano")?.porcentaje ?? 0) >= 60)
    recs.push("El tamaño y complejidad operativa ya justifican estructuras de gobierno más sofisticadas.");

  // Motivación baja (P10=idx9, P11=idx10 → ambas 0)
  const p10 = respuestas[9]; const p11 = respuestas[10];
  if (p10 === 0 && p11 === 0)
    recs.push("La motivación declarada es principalmente externa. Los directorios que funcionan nacen de una convicción interna — vale la pena revisar si el momento es el correcto.");

  return {
    score: scoreTotal,
    nivel,
    porcentaje,
    scoresPorDimension: scoresDim.map(d => ({ nombre: d.nombre, score: d.score, max: d.max, porcentaje: d.porcentaje, key: d.key })),
    recomendaciones: recs,
  };
}

// ─── Live partial calculation ──────────────────────────────────────────────────

export function calcularPorcentajeParcial(respuestas: number[]): number {
  let sum = 0; let answered = 0;
  respuestas.forEach((opcionIdx, pregIdx) => {
    if (opcionIdx < 0) return;
    const pregunta = PREGUNTAS_M1[pregIdx];
    if (!pregunta) return;
    sum += pregunta.opciones[opcionIdx].puntaje;
    answered++;
  });
  if (answered === 0) return 0;
  return Math.round((sum / (answered * 3)) * 100);
}

export function generarInformeParcial(respuestas: number[]): string {
  const answered = respuestas.filter(v => v >= 0).length;
  if (answered === 0) return '';

  const pct = calcularPorcentajeParcial(respuestas);
  const signals: string[] = [];

  const get = (idx: number) => (respuestas[idx] >= 0 ? respuestas[idx] : -1);

  if (get(0) >= 2) signals.push('el tamaño del equipo');
  if (get(1) >= 2) signals.push('el volumen de facturación');
  if (get(2) >= 2) signals.push('la complejidad en la estructura de propiedad');
  if (get(3) >= 2) signals.push('la proximidad de un proceso de sucesión');
  if (get(4) <= 1 && get(4) >= 0) signals.push('la informalidad en la toma de decisiones estratégicas');
  if (get(5) <= 1 && get(5) >= 0) signals.push('la falta de separación entre dueño y gerencia');
  if (get(6) <= 1 && get(6) >= 0) signals.push('la ausencia de un proceso claro para decisiones imprevistas');
  if (get(7) <= 1 && get(7) >= 0) signals.push('la concentración del poder en una sola persona');
  if (get(8) <= 1 && get(8) >= 0) signals.push('la escasa frecuencia de reuniones estratégicas');
  if (get(11) >= 2) signals.push('la disponibilidad para reunirse regularmente');
  if (get(13) <= 1 && get(13) >= 0) signals.push('las restricciones de presupuesto para el directorio');

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (pct < 30) {
    return signals.length > 0
      ? `Hasta aquí, la empresa muestra un perfil de baja complejidad. Vale la pena observar ${signals[0]}, pero no hay urgencia inmediata.`
      : 'Con las respuestas hasta ahora, la empresa no muestra señales urgentes que justifiquen un directorio formal.';
  }
  if (pct < 55) {
    const f = signals[0] ?? 'algunos factores relevantes';
    return `Las respuestas muestran señales tempranas. ${cap(f)} empieza a justificar una estructura de gobierno más formal, aunque todavía no es urgente.`;
  }
  if (pct < 75) {
    const fs = signals.slice(0, 2).join(' y ') || 'varios factores';
    return `La empresa está en un momento de transición. ${cap(fs)} indican que un directorio agregaría valor concreto en esta etapa.`;
  }
  const fs = signals.slice(0, 3).join(', ') || 'múltiples dimensiones';
  return `Las respuestas apuntan a una necesidad clara. ${cap(fs)} son señales sólidas de que operar sin un directorio representa un riesgo real.`;
}
