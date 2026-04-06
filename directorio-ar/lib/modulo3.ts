import type { Modulo3Resultado } from "../types";

type Perfil = "estratega" | "financiero" | "comercial" | "empresario";

type ScoreMap = Record<Perfil, number>;

function empty(): ScoreMap {
  return { estratega: 0, financiero: 0, comercial: 0, empresario: 0 };
}

function add(map: ScoreMap, updates: Partial<ScoreMap>): ScoreMap {
  const result = { ...map };
  for (const [k, v] of Object.entries(updates)) {
    result[k as Perfil] = (result[k as Perfil] ?? 0) + (v ?? 0);
  }
  return result;
}

// ─── Scoring matrix — 15 preguntas × 4 opciones → pesos por perfil ────────────

const PREGUNTAS_SCORING: Array<Array<Partial<ScoreMap>>> = [
  // P1 — Etapa de la empresa
  [
    { comercial: 2, estratega: 1 },                        // Startup
    { estratega: 2, financiero: 1, empresario: 1 },        // PyME consolidada
    { estratega: 3, comercial: 2, financiero: 1 },         // En expansión
    { estratega: 2, financiero: 2, empresario: 1 },        // Empresa madura
  ],
  // P2 — Distribución de la propiedad
  [
    { empresario: 2, estratega: 1 },                       // Un solo dueño
    { estratega: 1, empresario: 2, financiero: 1 },        // Dos o tres socios
    { empresario: 3, financiero: 1 },                      // Familia 2da/3ra gen
    { financiero: 3, estratega: 2 },                       // Socios mixtos con inversores
  ],
  // P3 — Sucesión
  [
    {},                                                    // No aplica
    { empresario: 2, financiero: 1 },                      // En el horizonte
    { empresario: 3, financiero: 2 },                      // En proceso activo
    { empresario: 3, financiero: 2, estratega: 1 },        // Ya ocurrió con tensiones
  ],
  // P4 — Perfil financiero
  [
    { financiero: 1 },                                     // Sin deuda
    { financiero: 2, empresario: 1 },                      // Créditos bancarios
    { financiero: 3, empresario: 1 },                      // Deuda mediano plazo
    { financiero: 3, estratega: 2 },                       // ONs/fondos
  ],
  // P5 — Dificultades financieras
  [
    {},                                                    // Siempre estable
    { financiero: 1, empresario: 1 },                      // Tensión puntual
    { financiero: 3, empresario: 2 },                      // Problemas activos
    { financiero: 3, empresario: 3 },                      // Reestructuración
  ],
  // P6 — Regulación
  [
    { comercial: 1 },                                      // Poca
    { comercial: 1, financiero: 1 },                       // Moderada
    { financiero: 2, empresario: 2 },                      // Alta sectorial
    { financiero: 2, empresario: 3 },                      // Nac. y provincial compleja
  ],
  // P7 — Internacional
  [
    { comercial: 1, empresario: 1 },                       // Solo Argentina
    { comercial: 2, estratega: 1 },                        // Exportaciones menores
    { estratega: 3, comercial: 2 },                        // Exportación activa
    { estratega: 3, comercial: 3 },                        // Operaciones internacionales
  ],
  // P8 — Cantidad de personas
  [
    { empresario: 1 },                                     // Menos de 20
    { empresario: 2, comercial: 1 },                       // 20 a 60
    { empresario: 2, estratega: 1 },                       // 60 a 200
    { estratega: 2, financiero: 2, empresario: 1 },        // Más de 200
  ],
  // P9 — Organización interna
  [
    { empresario: 2, estratega: 1 },                       // Dueño opera todo
    { estratega: 2, empresario: 1 },                       // Gerentes pero dueño decide
    { estratega: 2, financiero: 1 },                       // Gerentes con autonomía
    { financiero: 2, estratega: 2 },                       // Gerencia independiente
  ],
  // P10 — Tecnología
  [
    { empresario: 1 },                                     // Soporte básico
    { comercial: 1, estratega: 1 },                        // Modernizando
    { estratega: 2, comercial: 2 },                        // Prioridad estratégica
    { estratega: 3, comercial: 2 },                        // Redefine el modelo
  ],
  // P11 — Inversores externos
  [
    { empresario: 1 },                                     // No hay planes
    { financiero: 1, empresario: 1 },                      // En análisis
    { financiero: 2, estratega: 2 },                       // Conversaciones avanzadas
    { financiero: 3, estratega: 2 },                       // Ya hay inversor
  ],
  // P12 — Conflictos
  [
    {},                                                    // Tranquilo
    { empresario: 1, financiero: 1 },                      // Roces menores
    { empresario: 3, financiero: 2 },                      // Conflictos serios
    { empresario: 3, financiero: 2, estratega: 1 },        // Conflictos activos
  ],
  // P13 — M&A / venta
  [
    {},                                                    // No hay planes
    { estratega: 1, financiero: 1 },                       // Mediano plazo
    { estratega: 3, financiero: 3 },                       // Operación concreta
    { estratega: 3, financiero: 3, comercial: 1 },         // Venta o fusión inminente
  ],
  // P14 — Reputación
  [
    {},                                                    // Sin visibilidad
    { comercial: 1, empresario: 1 },                       // Reputación sectorial
    { comercial: 3, estratega: 1 },                        // Marca importante
    { comercial: 3, estratega: 2 },                        // Reputación crítica
  ],
  // P15 — Nivel de gobierno actual
  [
    { empresario: 2, estratega: 1 },                       // Bajo (todo informal)
    { empresario: 2, estratega: 1 },                       // Medio
    { estratega: 2, financiero: 1 },                       // Alto
    { estratega: 3, financiero: 2 },                       // Muy alto
  ],
];

// ─── Questions ────────────────────────────────────────────────────────────────

export const PREGUNTAS_M3 = [
  {
    texto: "¿En qué etapa se encuentra la empresa?",
    opciones: ["Startup (menos de 5 años)", "PyME consolidada", "En expansión", "Empresa madura"],
  },
  {
    texto: "¿Cómo está distribuida la propiedad?",
    opciones: ["Un solo dueño", "Dos o tres socios", "Familia 2da/3ra generación", "Socios mixtos (incluyendo inversores)"],
  },
  {
    texto: "¿Existe un proceso de sucesión en el horizonte?",
    opciones: ["No aplica", "En el horizonte (3-5 años)", "En proceso activo", "Ya ocurrió con tensiones"],
  },
  {
    texto: "¿Cuál es el perfil financiero de la empresa?",
    opciones: ["Sin deuda significativa", "Créditos bancarios", "Deuda de mediano plazo", "ONs, fondos o deuda estructurada"],
  },
  {
    texto: "¿Ha tenido la empresa dificultades financieras o conflictos costosos?",
    opciones: ["Siempre estable", "Tensión puntual resuelta", "Problemas activos", "Reestructuración o crisis grave"],
  },
  {
    texto: "¿Qué nivel de regulación enfrenta la empresa?",
    opciones: ["Poca regulación", "Moderada", "Alta (sector regulado)", "Nacional y provincial compleja"],
  },
  {
    texto: "¿Tiene la empresa actividad internacional?",
    opciones: ["Solo Argentina", "Exportaciones menores", "Exportación activa", "Operaciones internacionales"],
  },
  {
    texto: "¿Cuántas personas trabajan en la empresa?",
    opciones: ["Menos de 20", "Entre 20 y 60", "Entre 60 y 200", "Más de 200"],
  },
  {
    texto: "¿Cómo está organizada la empresa actualmente?",
    opciones: ["El dueño opera el día a día", "Gerentes pero el dueño decide todo", "Gerentes con autonomía", "Gerencia independiente"],
  },
  {
    texto: "¿Qué rol juega la tecnología en la empresa?",
    opciones: ["Soporte operativo básico", "Modernizando procesos", "Prioridad estratégica", "Redefine el modelo de negocio"],
  },
  {
    texto: "¿Existen planes de incorporar inversores externos?",
    opciones: ["No hay planes", "En análisis inicial", "Conversaciones avanzadas", "Ya hay un inversor como socio"],
  },
  {
    texto: "¿Existen conflictos entre socios o entre familia y empresa?",
    opciones: ["Tranquilo", "Roces menores", "Conflictos serios", "Conflictos activos o judicializados"],
  },
  {
    texto: "¿Hay planes de fusión, adquisición o venta?",
    opciones: ["No hay planes", "Mediano plazo exploratorio", "Operación concreta en proceso", "Venta o fusión inminente"],
  },
  {
    texto: "¿Qué importancia tiene la reputación para el negocio?",
    opciones: ["Sin visibilidad pública", "Reputación sectorial", "Marca importante en el mercado", "Reputación crítica para el negocio"],
  },
  {
    texto: "¿Cuál es el nivel de formalización del gobierno actual?",
    opciones: ["Bajo (todo informal)", "Medio (algunas reglas)", "Alto (procesos definidos)", "Muy alto (gobierno profesional)"],
  },
];

// ─── Rich profile definitions ─────────────────────────────────────────────────

export const PERFILES_DETALLE: Record<Perfil, {
  nombre: string;
  tagline: string;
  descripcion: string;
  carreras: string[];
  titulos: string[];
  experienciaAnios: string;
  rolesEmpresariales: string[];
  puntosClave: string[];
}> = {
  estratega: {
    nombre: "Estratega",
    tagline: "Visión de mercado · Decisiones de alto impacto · Independiente",
    descripcion: "Actúa como caja de resonancia del CEO. Aporta una mirada externa sobre competidores, tendencias de mercado y posicionamiento a largo plazo. No opera — orienta. Su valor está en cuestionar las decisiones importantes antes de que se tomen, no después.",
    carreras: ["MBA (local o internacional)", "Administración de Empresas", "Ingeniería Industrial", "Economía"],
    titulos: ["CEO o ex-CEO de empresa mediana/grande", "Gerente General con P&L propio", "Socio de consultoría estratégica", "Director General de unidad de negocio"],
    experienciaAnios: "Mínimo 15 años en posiciones de liderazgo con responsabilidad sobre resultados.",
    rolesEmpresariales: [
      "Lideró empresas de más de 100 empleados o con operaciones regionales",
      "Tomó decisiones de expansión, lanzamiento de productos o entrada a mercados nuevos",
      "Gestionó relaciones con bancos, inversores o socios estratégicos",
      "Participó en procesos de venta, fusión o reestructuración empresarial",
    ],
    puntosClave: [
      "Debe ser genuinamente independiente — no puede ser proveedor, cliente ni familiar del dueño",
      "Su aporte es de calidad, no de cantidad: una buena pregunta en la reunión vale más que diez opiniones operativas",
    ],
  },

  financiero: {
    nombre: "Financiero",
    tagline: "Control de gestión · Deuda · Mercado de capitales argentino",
    descripcion: "Domina la lectura de balances, el análisis de deuda y el control de gestión. En Argentina, su valor adicional es conocer el mercado local: SGR, fideicomisos, ONs PyME, líneas BICE y la dinámica de trabajar con bancos en contexto inflacionario. Imprescindible cuando hay crédito significativo o inversores.",
    carreras: ["Contador Público (UBA, UNC, UNR o similar)", "Licenciatura en Economía", "Finanzas Corporativas", "MBA con especialización financiera"],
    titulos: ["CFO o Director Financiero", "Socio o gerente de auditoría (Big Four o firmas locales)", "Controller de empresa mediana", "Gerente de Finanzas Corporativas"],
    experienciaAnios: "Mínimo 12 años en finanzas corporativas, preferentemente con experiencia en empresas de tamaño similar a la que va a integrar.",
    rolesEmpresariales: [
      "Preparó y presentó estados contables ante bancos o inversores",
      "Gestionó deuda estructurada, refinanciaciones o acceso a mercado de capitales",
      "Implementó sistemas de control de gestión y tablero de comando",
      "Trabajo en empresas con estructura de costos compleja o en sectores regulados",
    ],
    puntosClave: [
      "En Argentina, la experiencia con inflación crónica y tipo de cambio dual es un diferencial real — no es un dato menor",
      "Debe poder leer el balance de la empresa y hacer preguntas incómodas al CEO antes de que llegue el problema",
    ],
  },

  comercial: {
    nombre: "Comercial",
    tagline: "Mercado · Clientes · Crecimiento · Canales",
    descripcion: "Aporta la mirada desde el lado de la demanda: clientes, canales, pricing, marca y crecimiento. Ayuda al directorio a entender si la empresa está bien posicionada, si hay oportunidades de expansión geográfica o de producto, y si la propuesta de valor sigue siendo relevante frente a la competencia.",
    carreras: ["Licenciatura en Marketing", "Administración de Empresas", "Comunicación", "Ingeniería Industrial con orientación comercial"],
    titulos: ["Gerente Comercial o Director de Ventas", "CCO (Chief Commercial Officer)", "Gerente de Marketing y Producto", "Director de Canales o Key Account Manager senior"],
    experienciaAnios: "Mínimo 10 años en posiciones comerciales con equipo a cargo y responsabilidad sobre facturación.",
    rolesEmpresariales: [
      "Gestionó carteras de clientes grandes o desarrolló canales de distribución",
      "Lideró lanzamientos de productos o ingreso a nuevas regiones",
      "Trabajó en empresas de consumo masivo, retail, agro o servicios con volumen",
      "Tiene experiencia en pricing, negociación y gestión de la fuerza de ventas",
    ],
    puntosClave: [
      "Particularmente valioso cuando la empresa quiere crecer pero no tiene claro cómo — aporta el 'cómo' desde afuera",
      "También relevante cuando la reputación de marca es un activo crítico que el directorio necesita proteger activamente",
    ],
  },

  empresario: {
    nombre: "Empresario Referente",
    tagline: "Experiencia PyME · Contexto argentino · Red institucional",
    descripcion: "El perfil más realista para la mayoría de las PyMEs argentinas. Es alguien que construyó, gestionó y sobrevivió empresas en Argentina: conoce de primera mano lo que es operar con inflación, paritarias, AFIP, acceso al crédito difícil y crisis cíclicas. Aporta sentido común empresarial, red de contactos reales y la capacidad de hablar el mismo idioma que el dueño.",
    carreras: ["Trayectoria diversa — puede ser Contador, Ingeniero, Abogado o no tener título universitario relevante", "Lo que importa es la experiencia construida, no el diploma", "A veces complementada con programas ejecutivos (IAE, UTDT, UCEMA)"],
    titulos: ["Fundador o ex-dueño de PyME exitosa (idealmente del mismo sector o similar)", "Presidente o ex-presidente de cámara empresarial o asociación sectorial", "Mentor en aceleradoras o programas PyME (SEPYME, Endeavor, ASEA)", "Ex-gerente general de empresa familiar de segunda generación"],
    experienciaAnios: "Mínimo 20 años operando en el mercado argentino, con al menos una empresa propia gestionada durante una crisis (2001, 2018, 2023).",
    rolesEmpresariales: [
      "Construyó o heredó una PyME y la hizo crecer o reconvirtió en contexto adverso",
      "Tiene vínculos activos con bancos de desarrollo (BICE, Banco Nación), SGR o fondos de garantía",
      "Participó en cámaras industriales o integró comités de crédito sectoriales",
      "Conoce el ecosistema real: proveedores, sindicatos, municipios, AFIP, regulaciones locales",
    ],
    puntosClave: [
      "Su valor no es académico sino práctico: puede decirle al dueño 'yo lo viví y te digo cómo salimos' — eso no lo da ningún consultor externo",
      "Fundamental en empresas familiares o de primera generación donde el fundador necesita validación de alguien que también construyó desde cero",
    ],
  },
};

// ─── Calculator ───────────────────────────────────────────────────────────────

export function calcularModulo3(respuestas: number[]): Modulo3Resultado {
  let scores = empty();
  respuestas.forEach((optionIdx, preguntaIdx) => {
    const scoring = PREGUNTAS_SCORING[preguntaIdx]?.[optionIdx];
    if (scoring) scores = add(scores, scoring);
  });

  const ranked = (Object.entries(scores) as [Perfil, number][])
    .sort((a, b) => b[1] - a[1]);

  const topPerfiles = ranked.map(([perfil, score]) => {
    let urgencia: string;
    if (score >= 10) urgencia = "Crítico";
    else if (score >= 6) urgencia = "Urgente";
    else if (score >= 3) urgencia = "Recomendado";
    else urgencia = "Complementario";

    const detalle = PERFILES_DETALLE[perfil];
    return {
      perfil,
      score,
      urgencia,
      descripcion: detalle.descripcion,
    };
  });

  return {
    score: ranked.reduce((sum, [, v]) => sum + v, 0),
    nivel: ranked[0]?.[0] ?? "",
    porcentaje: undefined,
    topPerfiles,
  };
}
