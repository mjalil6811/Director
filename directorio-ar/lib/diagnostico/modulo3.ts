import type { Modulo3Resultado } from "../../types";

// ─── Profile types ─────────────────────────────────────────────────────────────

export type PerfilKey = "estratega" | "financiero" | "comercial" | "operaciones";
export type NivelUrgencia = "Crítico" | "Urgente" | "Recomendado" | "Complementario";

export type PerfilDirectorio = {
  key: PerfilKey;
  nombre: string;
  icono: string;
  colorBg: string;
  colorTexto: string;
  independencia: string;
  descripcion: string;
  formacion: string;
  rolesPrevios: string[];
  anosExperiencia: string;
  senalClave: string;
  advertenciaArgentina: string;
  tags: string[];
};

export type ResultadoPerfil = {
  perfil: PerfilDirectorio;
  score: number;
  urgencia: NivelUrgencia;
  ranking: 1 | 2 | 3 | 4;
  justificacion: string;
};

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const PERFILES: Record<PerfilKey, PerfilDirectorio> = {
  estratega: {
    key: "estratega",
    nombre: "Estratega de negocio",
    icono: "ES",
    colorBg: "#EEEDFE",
    colorTexto: "#3C3489",
    independencia: "Generalmente independiente",
    descripcion:
      "Aporta visión de largo plazo, lectura del mercado y experiencia en tomar decisiones complejas bajo incertidumbre. En una PyME argentina es la caja de resonancia del CEO — cuestiona el statu quo desde una perspectiva externa con experiencia probada en resultados reales.",
    formacion:
      "Administración de Empresas, Ingeniería Industrial, Economía, MBA (local o exterior). No es excluyente — hay excelentes estrategas sin MBA pero con trayectoria ejecutiva sólida.",
    rolesPrevios: [
      "CEO o Gerente General de empresa mediana o grande",
      "Director de unidad de negocio con P&L propio",
      "Country Manager de multinacional",
      "Ex-fundador que haya escalado y vendido una empresa",
      "Director de Desarrollo de Negocios con track record comprobable",
    ],
    anosExperiencia:
      "Mínimo 15 años de trayectoria, con al menos 5 en posiciones de liderazgo con responsabilidad directa sobre resultados.",
    senalClave:
      "Ha tomado decisiones estratégicas propias — no solo las ha recomendado. Puede decirle al dueño algo que no quiere escuchar sin que la relación se rompa.",
    advertenciaArgentina:
      "Evitar confundir con el 'consultor amigo' que cobra honorarios y no tiene skin in the game. El estratega en el directorio asume responsabilidad institucional.",
    tags: ["Estrategia", "Visión", "Liderazgo"],
  },

  financiero: {
    key: "financiero",
    nombre: "Director Financiero",
    icono: "FI",
    colorBg: "#E1F5EE",
    colorTexto: "#085041",
    independencia: "Vinculado o independiente",
    descripcion:
      "Aporta rigor en la lectura de los números, estructura para la toma de decisiones financieras y capacidad de dialogar con bancos, inversores y auditores. En PyMEs argentinas donde la contabilidad está tercerizada y los balances llegan tarde, instala disciplina financiera real.",
    formacion:
      "Contador Público Nacional (CPN), Licenciado en Economía o Administración con especialización en finanzas. Posgrado en Finanzas Corporativas o MBA con orientación financiera. En Argentina el CPN con experiencia en empresas (no solo en estudio contable) es el perfil más accesible y valioso.",
    rolesPrevios: [
      "CFO o Gerente de Administración y Finanzas en empresa mediana o grande",
      "Controller corporativo con visión de negocio",
      "Gerente de crédito o riesgo en banco",
      "Socio de firma de auditoría con experiencia real en clientes PyME",
      "Director financiero de fondo de inversión",
    ],
    anosExperiencia:
      "Mínimo 12 años, con al menos 3 como responsable máximo del área financiera. Debe haber tomado decisiones de deuda, estructurado créditos y presentado balances ante terceros.",
    senalClave:
      "Puede leer un balance en 10 minutos y detectar lo que no cierra. Entiende el sistema bancario argentino (SGR, leasing, descuento de cheques, ONs) y el impacto inflacionario en los estados contables.",
    advertenciaArgentina:
      "El contador de la empresa de toda la vida no es este perfil. El director financiero independiente tiene criterio propio — no defiende las decisiones pasadas que él mismo firmó.",
    tags: ["Finanzas", "Control", "Deuda"],
  },

  comercial: {
    key: "comercial",
    nombre: "Director Comercial",
    icono: "CO",
    colorBg: "#FAECE7",
    colorTexto: "#712B13",
    independencia: "Generalmente independiente",
    descripcion:
      "Aporta visión del mercado desde el lado de los ingresos: cómo crecer, cómo posicionarse, cómo desarrollar canales y cómo retener clientes clave. En PyMEs argentinas donde el dueño suele ser el principal vendedor, ayuda a despersonalizar la relación comercial y construir una fuerza de ventas escalable.",
    formacion:
      "Licenciado en Administración, Marketing, Comercialización o Comunicación. MBA con orientación comercial. También perfiles con formación técnica que hayan construido una carrera comercial sólida — muy común en industrias como agro, construcción o manufactura.",
    rolesPrevios: [
      "Director Comercial o Gerente de Ventas en empresa mediana o grande",
      "Gerente de Desarrollo de Negocios con track record medible",
      "Country Manager con responsabilidad directa sobre ingresos",
      "Director de Marketing con impacto directo en revenue",
      "Fundador de empresa con componente comercial fuerte y escalable",
    ],
    anosExperiencia:
      "Mínimo 12 años, con al menos 5 liderando equipos comerciales con metas de facturación. Debe haber gestionado carteras de clientes relevantes y diseñado estrategias go-to-market.",
    senalClave:
      "Tiene red de contactos en la industria que puede abrir puertas. Ha diseñado estructuras de incentivos para equipos de venta. Entiende cómo vender en contexto inflacionario argentino (listas de precios, descuentos, financiación en cuotas).",
    advertenciaArgentina:
      "Evitar al 'vendedor estrella' que fue muy bueno vendiendo pero nunca lideró un equipo ni pensó estratégicamente. El director comercial en el directorio opera desde la supervisión, no desde la ejecución.",
    tags: ["Comercial", "Ventas", "Mercado"],
  },

  operaciones: {
    key: "operaciones",
    nombre: "Director de Operaciones",
    icono: "OP",
    colorBg: "#EAF3DE",
    colorTexto: "#27500A",
    independencia: "Generalmente independiente",
    descripcion:
      "Aporta experiencia en escalar procesos, estructurar la organización interna y hacer que la empresa funcione de forma ordenada cuando crece. En PyMEs argentinas que pasaron de 10 a 50 personas sin sistematizar nada, pone orden sin ahogar la agilidad. Es el perfil más 'tierra' de los cuatro — habla de procesos, métricas, estructura y ejecución.",
    formacion:
      "Ingeniería Industrial, Licenciatura en Administración, Ingeniería en Sistemas o carreras técnicas afines. Posgrados en Operaciones, Supply Chain o Gestión de Proyectos (PMP). En PyMEs industriales o de servicios, la formación técnica combinada con experiencia de gestión es muy valorada.",
    rolesPrevios: [
      "COO o Gerente de Operaciones en empresa mediana",
      "Gerente de Planta o Producción con responsabilidad ampliada a logística",
      "Gerente de Proyectos que haya liderado transformaciones organizacionales",
      "Director de Supply Chain con visión end-to-end",
      "Consultor de operaciones que haya implementado mejoras en PyMEs",
    ],
    anosExperiencia:
      "Mínimo 12 años, con al menos 4 en rol de liderazgo operativo con equipo a cargo y responsabilidad sobre KPIs de eficiencia, calidad o entrega.",
    senalClave:
      "Ha implementado sistemas de gestión (ERP, CRM, ISO) en organizaciones que no los tenían. Sabe cómo diseñar procesos que escalen sin depender de personas clave. Entiende los desafíos de operar en Argentina: logística, importaciones, costos variables, ausentismo.",
    advertenciaArgentina:
      "No confundir con el gerente operativo interno que conoce el negocio de memoria pero nunca miró hacia afuera. El director de operaciones en el directorio tiene perspectiva comparada.",
    tags: ["Operaciones", "Procesos", "Escala"],
  },
};

// ─── Questions ─────────────────────────────────────────────────────────────────

type PesosRespuesta = Partial<Record<PerfilKey, number>>;
type OpcionM3 = { texto: string; pesos: PesosRespuesta };
type PreguntaM3 = { numero: number; dimension: string; texto: string; aclaracion: string; opciones: [OpcionM3, OpcionM3, OpcionM3, OpcionM3] };

export const PREGUNTAS_M3: PreguntaM3[] = [
  {
    numero: 1, dimension: "Estrategia",
    texto: "¿La empresa tiene una estrategia a 3-5 años documentada y compartida?",
    aclaracion: "La existencia de una estrategia formal indica madurez organizacional.",
    opciones: [
      { texto: "No existe nada formal ni documentado", pesos: { estratega: 3 } },
      { texto: "Hay ideas compartidas pero nada escrito", pesos: { estratega: 2, operaciones: 1 } },
      { texto: "Existe un documento pero no se actualiza ni se sigue", pesos: { estratega: 2 } },
      { texto: "Hay un plan estratégico vigente con revisión periódica", pesos: { operaciones: 1 } },
    ],
  },
  {
    numero: 2, dimension: "Propiedad",
    texto: "¿La estructura de propiedad está formalizada en estatutos y acuerdos de socios?",
    aclaracion: "Tener la propiedad escrita formalmente en estatutos es distinto a que 'todos saben quién es dueño de qué'.",
    opciones: [
      { texto: "No hay estatutos actualizados ni acuerdo de socios", pesos: { financiero: 2, operaciones: 1 } },
      { texto: "Hay estatutos básicos pero desactualizados", pesos: { financiero: 2 } },
      { texto: "Los estatutos están al día pero no hay acuerdo de socios", pesos: { financiero: 1, estratega: 1 } },
      { texto: "Estatutos actualizados y acuerdo de socios vigente", pesos: { estratega: 1 } },
    ],
  },
  {
    numero: 3, dimension: "Propiedad",
    texto: "¿Existe o está planificado un proceso de sucesión o traspaso generacional?",
    aclaracion: "La sucesión es el momento de mayor riesgo en empresas familiares argentinas.",
    opciones: [
      { texto: "No aplica a nuestra empresa",                     pesos: {} },
      { texto: "Está en el horizonte pero no es inmediato",       pesos: { financiero: 1 } },
      { texto: "Está en proceso activo",                          pesos: { financiero: 2, estratega: 1 } },
      { texto: "Ya ocurrió y hay tensiones sin resolver",         pesos: { financiero: 2, estratega: 2 } },
    ],
  },
  {
    numero: 4, dimension: "Finanzas",
    texto: "¿Cuál es la situación financiera actual de la empresa?",
    aclaracion: "El nivel de deuda define la urgencia del perfil financiero.",
    opciones: [
      { texto: "Sin deuda estructural, operamos con capital propio",           pesos: { operaciones: 1 } },
      { texto: "Créditos bancarios habituales de corto plazo",                 pesos: { financiero: 2 } },
      { texto: "Deuda de mediano o largo plazo activa o planificada",          pesos: { financiero: 3 } },
      { texto: "Obligaciones negociables, fondos o deuda estructurada",        pesos: { financiero: 3, estratega: 1 } },
    ],
  },
  {
    numero: 5, dimension: "Finanzas",
    texto: "¿La empresa ha tenido o tiene dificultades financieras significativas?",
    aclaracion: "Las crisis financieras activan necesidades de gobierno muy específicas.",
    opciones: [
      { texto: "No, la situación financiera siempre fue estable",              pesos: {} },
      { texto: "Tuvimos tensiones puntuales ya superadas",                     pesos: { financiero: 1 } },
      { texto: "Hay problemas activos que impactan la operación",              pesos: { financiero: 3, operaciones: 1 } },
      { texto: "Estamos en reestructuración o proceso concursal",              pesos: { financiero: 3, estratega: 1 } },
    ],
  },
  {
    numero: 6, dimension: "Industria",
    texto: "¿Qué tan regulada es la industria en la que opera la empresa?",
    aclaracion: "Sectores como alimentos, salud o financiero tienen alta carga regulatoria en Argentina.",
    opciones: [
      { texto: "Poca regulación específica de la industria",                   pesos: { operaciones: 1 } },
      { texto: "Regulación moderada, cumplimos sin dificultad",                pesos: { operaciones: 1, financiero: 1 } },
      { texto: "Alta regulación sectorial o habilitaciones críticas",          pesos: { financiero: 2, operaciones: 2 } },
      { texto: "Regulación nacional y provincial compleja, riesgo de sanciones", pesos: { financiero: 2, operaciones: 2, estratega: 1 } },
    ],
  },
  {
    numero: 7, dimension: "Mercado",
    texto: "¿La empresa exporta o tiene planes serios de expansión internacional?",
    aclaracion: "La internacionalización exige un perfil que el mercado local raramente provee.",
    opciones: [
      { texto: "No, operamos exclusivamente en Argentina",                     pesos: { comercial: 1 } },
      { texto: "Exportaciones menores o esporádicas",                          pesos: { comercial: 2 } },
      { texto: "Exportación activa o expansión regional en curso",             pesos: { comercial: 3, estratega: 2 } },
      { texto: "Internacionalización como eje estratégico central",            pesos: { estratega: 3, comercial: 3 } },
    ],
  },
  {
    numero: 8, dimension: "Tecnología",
    texto: "¿Cuán central es la transformación digital para el negocio?",
    aclaracion: "No hablamos de tener una web — hablamos de si la tecnología puede cambiar el modelo de negocio.",
    opciones: [
      { texto: "La tecnología es un soporte, no un diferenciador",             pesos: { operaciones: 1 } },
      { texto: "Estamos modernizando procesos pero no es urgente",             pesos: { operaciones: 2 } },
      { texto: "La digitalización es una prioridad estratégica activa",        pesos: { operaciones: 2, estratega: 1 } },
      { texto: "La tecnología puede redefinir nuestro modelo de negocio",      pesos: { estratega: 2, operaciones: 2 } },
    ],
  },
  {
    numero: 9, dimension: "Mercado",
    texto: "¿La empresa tiene competidores fuertes o el mercado está cambiando rápido?",
    aclaracion: "La presión competitiva define la urgencia del perfil comercial y estratégico.",
    opciones: [
      { texto: "Mercado estable, sin presión competitiva relevante",            pesos: { operaciones: 1 } },
      { texto: "Algo de presión pero manejable",                               pesos: { comercial: 1, estratega: 1 } },
      { texto: "Competencia intensa o mercado en cambio",                      pesos: { comercial: 2, estratega: 2 } },
      { texto: "El negocio actual está en riesgo si no cambiamos algo pronto", pesos: { estratega: 3, comercial: 3 } },
    ],
  },
  {
    numero: 10, dimension: "Comercial",
    texto: "¿Cómo llegan hoy los nuevos clientes a la empresa?",
    aclaracion: "La dependencia comercial del dueño es uno de los riesgos más subestimados en PyMEs argentinas.",
    opciones: [
      { texto: "Por el dueño y sus contactos personales exclusivamente",       pesos: { comercial: 3 } },
      { texto: "Por boca a boca sin acción comercial activa",                  pesos: { comercial: 2 } },
      { texto: "Hay un equipo comercial pero sin estrategia clara",            pesos: { comercial: 2, estratega: 1 } },
      { texto: "Tenemos canales y procesos comerciales bien definidos",        pesos: { estratega: 1 } },
    ],
  },
  {
    numero: 11, dimension: "Estrategia",
    texto: "¿La empresa tiene planes de adquisición, fusión, venta total o parcial?",
    aclaracion: "Las operaciones de M&A son las que más requieren gobierno sofisticado.",
    opciones: [
      { texto: "No está en los planes",                          pesos: { operaciones: 1 } },
      { texto: "Se evalúa en el mediano plazo",                  pesos: { estratega: 1, financiero: 1 } },
      { texto: "Hay una operación concreta en proceso",          pesos: { estratega: 3, financiero: 3 } },
      { texto: "La empresa está en venta o proceso de fusión activo", pesos: { estratega: 3, financiero: 3 } },
    ],
  },
  {
    numero: 12, dimension: "Operaciones",
    texto: "¿La empresa tiene procesos documentados y sistemas de gestión implementados?",
    aclaracion: "La informalidad operativa es el principal freno al crecimiento en PyMEs argentinas.",
    opciones: [
      { texto: "Todo está en la cabeza de las personas clave",                         pesos: { operaciones: 3 } },
      { texto: "Hay algo documentado pero muy informal",                               pesos: { operaciones: 2 } },
      { texto: "Procesos documentados pero no siempre respetados",                     pesos: { operaciones: 1 } },
      { texto: "Sistemas y procesos funcionando con métricas de seguimiento",          pesos: { estratega: 1 } },
    ],
  },
  {
    numero: 13, dimension: "Gobierno",
    texto: "¿Cuál es la disposición real del CEO o dueño a rendir cuentas ante un directorio?",
    aclaracion: "Esta pregunta define qué tan rápido y profundo puede ser el proceso de gobierno.",
    opciones: [
      { texto: "Baja — prefiere decidir solo, sin supervisión externa",              pesos: { operaciones: 1 } },
      { texto: "Media — lo acepta pero genera algo de incomodidad",                  pesos: { estratega: 1, operaciones: 1 } },
      { texto: "Alta — lo busca activamente aunque de forma informal",               pesos: { estratega: 2, financiero: 1 } },
      { texto: "Muy alta — está listo/a para implementar gobierno formal",           pesos: { estratega: 3, financiero: 1, comercial: 1 } },
    ],
  },
  {
    numero: 14, dimension: "Mercado",
    texto: "¿La empresa tiene unidades de negocio o actividades vinculadas que operan de forma independiente?",
    aclaracion: "La diversificación de negocios multiplica la complejidad de las decisiones estratégicas.",
    opciones: [
      { texto: "Es un solo negocio sin actividades vinculadas", pesos: { operaciones: 1 } },
      { texto: "Tiene alguna actividad secundaria menor", pesos: { estratega: 1, operaciones: 1 } },
      { texto: "Tiene dos o tres unidades de negocio diferenciadas", pesos: { estratega: 2, financiero: 2 } },
      { texto: "Es un grupo con múltiples empresas o unidades", pesos: { estratega: 3, financiero: 3 } },
    ],
  },
  {
    numero: 15, dimension: "Mercado",
    texto: "¿Los ingresos de la empresa dependen de pocos clientes o están diversificados?",
    aclaracion: "La concentración de ingresos en pocos clientes es un riesgo estratégico que un directorio puede ayudar a gestionar.",
    opciones: [
      { texto: "Más del 50% depende de 1 o 2 clientes", pesos: { comercial: 3, estratega: 1 } },
      { texto: "Hay concentración pero con algo de diversificación", pesos: { comercial: 2 } },
      { texto: "Los ingresos están razonablemente diversificados", pesos: { comercial: 1 } },
      { texto: "Alta diversificación, ningún cliente supera el 10%", pesos: { estratega: 1 } },
    ],
  },
];

// ─── Calculator ────────────────────────────────────────────────────────────────

export function calcularUrgencia(score: number): NivelUrgencia {
  if (score >= 10) return "Crítico";
  if (score >= 7)  return "Urgente";
  if (score >= 4)  return "Recomendado";
  return "Complementario";
}

export const TOTAL_PREGUNTAS_M3 = PREGUNTAS_M3.length; // 15

// respuestas: number[] indexed 0–14 (option index chosen per question)
export function calcularModulo3(respuestas: number[]): Modulo3Resultado {
  const scores: Record<PerfilKey, number> = { estratega: 0, financiero: 0, comercial: 0, operaciones: 0 };
  const dimensionesActivadas: Record<PerfilKey, string[]> = { estratega: [], financiero: [], comercial: [], operaciones: [] };

  PREGUNTAS_M3.forEach((pregunta, idx) => {
    const opcionIdx = respuestas[idx];
    if (opcionIdx === undefined || opcionIdx < 0) return;
    const pesos = pregunta.opciones[opcionIdx].pesos;
    (Object.entries(pesos) as [PerfilKey, number][]).forEach(([key, peso]) => {
      if (!peso) return;
      scores[key] += peso;
      if (peso >= 2 && !dimensionesActivadas[key].includes(pregunta.dimension)) {
        dimensionesActivadas[key].push(pregunta.dimension);
      }
    });
  });

  const ordenados = (Object.keys(scores) as PerfilKey[]).sort((a, b) => scores[b] - scores[a]);

  const topPerfiles = ordenados.slice(0, 4).map((key, i) => {
    const perfil = PERFILES[key];
    const score = scores[key];
    const urgencia = calcularUrgencia(score);
    const dims = dimensionesActivadas[key];
    const justificacion = dims.length > 0
      ? `${perfil.descripcion} Lo señalan especialmente: ${dims.slice(0, 2).join(" y ")}.`
      : perfil.descripcion;

    return {
      perfil: key,
      score,
      urgencia,
      ranking: (i + 1) as 1 | 2 | 3 | 4,
      justificacion,
      descripcion: justificacion,
    };
  });

  return {
    score: scores[ordenados[0]] ?? 0,
    nivel: ordenados[0] ?? "",
    porcentaje: undefined,
    topPerfiles,
    scoresCompletos: scores,
  };
}
