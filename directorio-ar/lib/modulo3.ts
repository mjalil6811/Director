import type { Modulo3Resultado } from "../types";
import { PREGUNTAS_M3 } from "./preguntas";

export { PREGUNTAS_M3 } from "./preguntas";

// ─── Profile types ─────────────────────────────────────────────────────────────

export type PerfilKey = "estratega" | "financiero" | "comercial" | "operaciones";
export type NivelUrgencia = "Crítico" | "Urgente" | "Recomendado" | "Complementario";

export type PerfilDirectorio = {
  key: PerfilKey;
  nombre: string;
  /** Nombre corto para gráficos y etiquetas. */
  corto: string;
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

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const PERFILES: Record<PerfilKey, PerfilDirectorio> = {
  estratega: {
    key: "estratega",
    nombre: "Asesor estratégico",
    corto: "Estratégico",
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
    nombre: "Asesor financiero",
    corto: "Financiero",
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
      "El contador de la empresa de toda la vida no es este perfil. El asesor financiero independiente tiene criterio propio — no defiende las decisiones pasadas que él mismo firmó.",
    tags: ["Finanzas", "Control", "Deuda"],
  },

  comercial: {
    key: "comercial",
    nombre: "Asesor comercial",
    corto: "Comercial",
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
      "Evitar al 'vendedor estrella' que fue muy bueno vendiendo pero nunca lideró un equipo ni pensó estratégicamente. El asesor comercial en el consejo opera desde la supervisión, no desde la ejecución.",
    tags: ["Comercial", "Ventas", "Mercado"],
  },

  operaciones: {
    key: "operaciones",
    nombre: "Asesor de operaciones",
    corto: "Operaciones",
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
      "No confundir con el gerente operativo interno que conoce el negocio de memoria pero nunca miró hacia afuera. El asesor de operaciones en el consejo tiene perspectiva comparada.",
    tags: ["Operaciones", "Procesos", "Escala"],
  },
};

// ─── Questions ─────────────────────────────────────────────────────────────────

// ─── Calculator ────────────────────────────────────────────────────────────────

export function calcularUrgencia(score: number): NivelUrgencia {
  // Calibrado para 8 preguntas
  if (score >= 7) return "Crítico";
  if (score >= 5) return "Urgente";
  if (score >= 3) return "Recomendado";
  return "Complementario";
}

export const TOTAL_PREGUNTAS_M3 = PREGUNTAS_M3.length; // 8

// respuestas: number[] indexed 0–7 (option index chosen per question)
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
