import type { Modulo3Resultado } from "../types";

type Perfil = "estratega" | "financiero" | "familiar" | "sector" | "legal" | "rrhh" | "digital" | "inversor" | "control" | "crisis";

type ScoreMap = Record<Perfil, number>;

function empty(): ScoreMap {
  return { estratega: 0, financiero: 0, familiar: 0, sector: 0, legal: 0, rrhh: 0, digital: 0, inversor: 0, control: 0, crisis: 0 };
}

function add(map: ScoreMap, updates: Partial<ScoreMap>): ScoreMap {
  const result = { ...map };
  for (const [k, v] of Object.entries(updates)) {
    result[k as Perfil] = (result[k as Perfil] ?? 0) + (v ?? 0);
  }
  return result;
}

const PREGUNTAS_SCORING: Array<Array<Partial<ScoreMap>>> = [
  // P1 Etapa
  [
    { digital: 2, legal: 1 },
    { estratega: 2, financiero: 1, sector: 1 },
    { estratega: 3, financiero: 2, digital: 1 },
    { estratega: 2, control: 2, rrhh: 1 },
  ],
  // P2 Propiedad
  [
    { estratega: 2, control: 1 },
    { estratega: 1, control: 2, legal: 1 },
    { familiar: 3, legal: 2, crisis: 1 },
    { familiar: 2, inversor: 3, legal: 2 },
  ],
  // P3 Sucesión
  [
    {},
    { familiar: 1, legal: 1 },
    { familiar: 3, legal: 2, crisis: 1 },
    { familiar: 3, crisis: 3, legal: 2 },
  ],
  // P4 Financiero
  [
    { financiero: 1 },
    { financiero: 2 },
    { financiero: 3, control: 2 },
    { financiero: 3, inversor: 2, control: 3 },
  ],
  // P5 Dificultades
  [
    {},
    { financiero: 1, control: 1 },
    { financiero: 3, crisis: 3, control: 2 },
    { financiero: 3, crisis: 3, legal: 3 },
  ],
  // P6 Regulación
  [
    { sector: 1 },
    { sector: 2, legal: 1 },
    { legal: 3, sector: 2 },
    { legal: 3, sector: 3, control: 2 },
  ],
  // P7 Internacional
  [
    { sector: 1 },
    { sector: 1, estratega: 1 },
    { estratega: 3, sector: 2 },
    { estratega: 3, sector: 3, legal: 1 },
  ],
  // P8 Personas
  [
    { estratega: 1 },
    { rrhh: 1, estratega: 1 },
    { rrhh: 2, control: 1 },
    { rrhh: 3, control: 2, estratega: 1 },
  ],
  // P9 Organización
  [
    { estratega: 2, control: 1 },
    { estratega: 2, rrhh: 1, control: 1 },
    { rrhh: 2, control: 2 },
    { control: 3, rrhh: 2, financiero: 1 },
  ],
  // P10 Digital
  [
    { sector: 1 },
    { digital: 1 },
    { digital: 3, estratega: 1 },
    { digital: 3, estratega: 2 },
  ],
  // P11 Inversores
  [
    { estratega: 1 },
    { estratega: 1, financiero: 1 },
    { inversor: 2, financiero: 2, legal: 1 },
    { inversor: 3, financiero: 2, control: 2 },
  ],
  // P12 Conflictos
  [
    {},
    { legal: 1, control: 1 },
    { legal: 2, crisis: 2, familiar: 1 },
    { legal: 3, crisis: 3, control: 2 },
  ],
  // P13 M&A
  [
    { estratega: 1 },
    { estratega: 2, financiero: 1 },
    { estratega: 3, financiero: 3, legal: 2 },
    { estratega: 3, financiero: 3, legal: 3, inversor: 2 },
  ],
  // P14 Reputación
  [
    { sector: 1 },
    { sector: 1, estratega: 1 },
    { estratega: 2, sector: 2 },
    { estratega: 2, legal: 2, sector: 2 },
  ],
  // P15 Gobierno
  [
    { control: 1, estratega: 1 },
    { estratega: 2, control: 1 },
    { estratega: 2, control: 2 },
    { estratega: 3, control: 3, financiero: 1 },
  ],
];

export const PREGUNTAS_M3 = [
  { texto: "¿En qué etapa se encuentra la empresa?", opciones: ["Startup (menos de 5 años)", "PyME consolidada", "En expansión", "Empresa madura"] },
  { texto: "¿Cómo está distribuida la propiedad?", opciones: ["Un solo dueño", "Dos o tres socios", "Familia 2da/3ra generación", "Socios mixtos (incluyendo inversores)"] },
  { texto: "¿Existe un proceso de sucesión en el horizonte?", opciones: ["No aplica", "En el horizonte (3-5 años)", "En proceso activo", "Ya ocurrió con tensiones"] },
  { texto: "¿Cuál es el perfil financiero de la empresa?", opciones: ["Sin deuda significativa", "Créditos bancarios", "Deuda de mediano plazo", "ONs, fondos o deuda estructurada"] },
  { texto: "¿Ha tenido la empresa dificultades financieras o conflictos costosos?", opciones: ["Siempre estable", "Tensión puntual resuelta", "Problemas activos", "Reestructuración o crisis grave"] },
  { texto: "¿Qué nivel de regulación enfrenta la empresa?", opciones: ["Poca regulación", "Moderada", "Alta (sector regulado)", "Nacional y provincial compleja"] },
  { texto: "¿Tiene la empresa actividad internacional?", opciones: ["Solo Argentina", "Exportaciones menores", "Exportación activa", "Operaciones internacionales"] },
  { texto: "¿Cuántas personas trabajan en la empresa?", opciones: ["Menos de 20", "Entre 20 y 60", "Entre 60 y 200", "Más de 200"] },
  { texto: "¿Cómo está organizada la empresa actualmente?", opciones: ["El dueño opera el día a día", "Gerentes pero el dueño decide todo", "Gerentes con autonomía", "Gerencia independiente"] },
  { texto: "¿Qué rol juega la tecnología en la empresa?", opciones: ["Soporte operativo básico", "Modernizando procesos", "Prioridad estratégica", "Redefine el modelo de negocio"] },
  { texto: "¿Existen planes de incorporar inversores externos?", opciones: ["No hay planes", "En análisis inicial", "Conversaciones avanzadas", "Ya hay un inversor como socio"] },
  { texto: "¿Existen conflictos entre socios o entre familia y empresa?", opciones: ["Tranquilo", "Roces menores", "Conflictos serios", "Conflictos activos o judicializados"] },
  { texto: "¿Hay planes de fusión, adquisición o venta?", opciones: ["No hay planes", "Mediano plazo exploratorio", "Operación concreta en proceso", "Venta o fusión inminente"] },
  { texto: "¿Qué importancia tiene la reputación para el negocio?", opciones: ["Sin visibilidad pública", "Reputación sectorial", "Marca importante en el mercado", "Reputación crítica para el negocio"] },
  { texto: "¿Cuál es el nivel de formalización del gobierno actual?", opciones: ["Bajo (todo informal)", "Medio (algunas reglas)", "Alto (procesos definidos)", "Muy alto (gobierno profesional)"] },
];

export const DESCRIPCIONES_PERFILES: Record<string, string> = {
  estratega:  "Visión de mercado y competencia. Experiencia liderando empresas o unidades complejas. Actúa como caja de resonancia del CEO en decisiones de alto impacto. Generalmente independiente.",
  financiero: "Lectura profunda de balances, deuda y control de gestión. Imprescindible cuando hay crédito bancario o inversores. Vinculado o independiente.",
  familiar:   "Voz de la familia propietaria. Clave en empresas de segunda generación o con conflictos entre herederos. Vinculado.",
  sector:     "Conocimiento profundo de la industria y red de contactos. Generalmente independiente.",
  legal:      "Riesgo regulatorio, contratos, estructura societaria. En Argentina imprescindible por la complejidad normativa. Vinculado o independiente.",
  rrhh:       "Talento, cultura organizacional y compensaciones. Relevante cuando la empresa supera las 50 personas. Generalmente independiente.",
  digital:    "Transformación digital aplicada al modelo de negocio. No es el CTO interno — es visión de cómo la tecnología puede cambiar la industria. Generalmente independiente.",
  inversor:   "Si hay un fondo o inversor ángel como socio, tienen derecho a un asiento. Mejora la disciplina de reporte. Vinculado.",
  control:    "Especialista en gobierno corporativo y control interno. Crítico cuando el directorio está en formación. Independiente.",
  crisis:     "Experiencia en reestructuraciones y conflictos societarios. Para momentos críticos. Independiente.",
};

export const PERFIL_LABELS: Record<string, string> = {
  estratega: "Estratega", financiero: "Financiero", familiar: "Familiar",
  sector: "Experto sectorial", legal: "Legal", rrhh: "RRHH",
  digital: "Digital", inversor: "Inversor", control: "Control", crisis: "Crisis",
};

export function calcularModulo3(respuestas: number[]): Modulo3Resultado {
  let scores = empty();
  respuestas.forEach((optionIdx, preguntaIdx) => {
    const scoring = PREGUNTAS_SCORING[preguntaIdx]?.[optionIdx];
    if (scoring) scores = add(scores, scoring);
  });

  const ranked = (Object.entries(scores) as [Perfil, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topPerfiles = ranked.map(([perfil, score]) => {
    let urgencia: string;
    if (score >= 8) urgencia = "Crítico";
    else if (score >= 5) urgencia = "Urgente";
    else if (score >= 3) urgencia = "Recomendado";
    else urgencia = "Complementario";
    return { perfil, score, urgencia, descripcion: DESCRIPCIONES_PERFILES[perfil] ?? "" };
  });

  return {
    score: ranked.reduce((sum, [, v]) => sum + v, 0),
    nivel: topPerfiles[0]?.perfil ?? "",
    porcentaje: undefined,
    topPerfiles,
  };
}
