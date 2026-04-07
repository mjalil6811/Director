import type { Modulo2Resultado } from "../types";

// Each situation now has its OWN set of options (not the same 4 for all)
export type OpcionM2 = { label: string; rol: string }; // rol: A/D/G/M
export type SituacionM2 = {
  texto: string;
  aclaracion: string;
  opciones: OpcionM2[];
  correcta: string; // which rol is correct
};

export const SITUACIONES_M2: SituacionM2[] = [
  // 1 — Crédito bancario → Director
  {
    texto: "El banco ofrece una línea de crédito importante. ¿Quién debería decidir si se toma?",
    aclaracion: "Endeudarse afecta el patrimonio de todos los socios.",
    opciones: [
      { label: "El dueño o CEO, que conoce las necesidades de caja", rol: "G" },
      { label: "El directorio, evaluando riesgo y capacidad de repago", rol: "D" },
      { label: "Los accionistas en asamblea", rol: "A" },
      { label: "El CFO o gerente de finanzas", rol: "G" },
      { label: "Entre todos informalmente, como siempre", rol: "M" },
    ],
    correcta: "D",
  },

  // 2 — Contratar vendedores → Gerente
  {
    texto: "El gerente comercial quiere contratar dos vendedores nuevos. ¿Quién da el visto bueno?",
    aclaracion: "Es una decisión operativa dentro de un presupuesto ya aprobado.",
    opciones: [
      { label: "El gerente comercial, dentro de su presupuesto", rol: "G" },
      { label: "El directorio, que aprueba cada incorporación", rol: "D" },
      { label: "El dueño, que siempre decide las contrataciones", rol: "A" },
      { label: "El COO o gerente de operaciones", rol: "G" },
      { label: "Se decide entre todos en una reunión informal", rol: "M" },
    ],
    correcta: "G",
  },

  // 3 — Abrir sucursal, socios en desacuerdo → Director
  {
    texto: "Dos socios están en desacuerdo sobre abrir una sucursal en el interior. ¿Quién resuelve?",
    aclaracion: "Es una decisión estratégica con impacto en la operación y el capital.",
    opciones: [
      { label: "El socio mayoritario tiene la última palabra", rol: "A" },
      { label: "El directorio analiza el caso y decide con independencia", rol: "D" },
      { label: "El gerente comercial que conoce el mercado del interior", rol: "G" },
      { label: "Se contrata un consultor externo que recomiende", rol: "M" },
      { label: "Se posterga hasta que se pongan de acuerdo solos", rol: "M" },
    ],
    correcta: "D",
  },

  // 4 — Queja de cliente urgente → Gerente
  {
    texto: "Un cliente importante llama con una queja urgente. El equipo no sabe cómo responder. ¿Quién resuelve?",
    aclaracion: "Es una situación operativa que requiere respuesta inmediata.",
    opciones: [
      { label: "El gerente comercial o de atención al cliente", rol: "G" },
      { label: "El dueño, que conoce al cliente personalmente", rol: "A" },
      { label: "El directorio en su próxima reunión", rol: "D" },
      { label: "El COO que coordina la operación diaria", rol: "G" },
      { label: "Cualquiera que esté disponible en el momento", rol: "M" },
    ],
    correcta: "G",
  },

  // 5 — Sueldo del CEO → Director
  {
    texto: "Hay que definir el sueldo del CEO para el año que viene. ¿Quién tiene autoridad legítima?",
    aclaracion: "Si el CEO fija su propio sueldo, hay un conflicto de interés evidente.",
    opciones: [
      { label: "El directorio, basándose en resultados y estudios de mercado", rol: "D" },
      { label: "Los accionistas en asamblea", rol: "A" },
      { label: "El propio CEO según lo que considere justo", rol: "G" },
      { label: "El CFO, comparando con empresas del sector", rol: "G" },
      { label: "Se mantiene igual que siempre, sin revisión formal", rol: "M" },
    ],
    correcta: "D",
  },

  // 6 — Comprar competidor → Director
  {
    texto: "Apareció la oportunidad de comprar una empresa competidora. ¿Quién evalúa y aprueba?",
    aclaracion: "Una adquisición compromete capital, estrategia y riesgo al mismo tiempo.",
    opciones: [
      { label: "El directorio evalúa, pide due diligence y aprueba formalmente", rol: "D" },
      { label: "El dueño decide porque es su plata", rol: "A" },
      { label: "El gerente de desarrollo de negocios recomienda y ejecuta", rol: "G" },
      { label: "El CFO analiza los números y da el OK financiero", rol: "G" },
      { label: "Se decide en una charla informal entre los socios", rol: "M" },
    ],
    correcta: "D",
  },

  // 7 — Malos resultados trimestrales → Director (gerente rinde al directorio)
  {
    texto: "Los resultados del trimestre fueron malos. ¿Quién le rinde cuentas a quién?",
    aclaracion: "La cadena de rendición de cuentas define la salud del gobierno corporativo.",
    opciones: [
      { label: "El CEO o gerente general presenta los resultados al directorio", rol: "D" },
      { label: "El gerente le informa directamente a los accionistas", rol: "A" },
      { label: "El CFO le explica al dueño lo que pasó", rol: "G" },
      { label: "El director le pide explicaciones al accionista mayoritario", rol: "M" },
      { label: "Nadie rinde cuentas formalmente — se habla cuando se puede", rol: "M" },
    ],
    correcta: "D",
  },

  // 8 — Hijo del dueño quiere entrar → Director
  {
    texto: "Un hijo del dueño quiere entrar a trabajar en la empresa. ¿Quién decide si ingresa, en qué rol y con qué sueldo?",
    aclaracion: "Mezclar familia y empresa sin reglas claras genera conflictos que pueden destruir ambas.",
    opciones: [
      { label: "El directorio, aplicando una política de ingreso para familiares", rol: "D" },
      { label: "El dueño, que es su empresa y su familia", rol: "A" },
      { label: "El gerente de RRHH, con el mismo proceso que cualquier empleado", rol: "G" },
      { label: "El COO que define los roles operativos", rol: "G" },
      { label: "Se resuelve en familia y después se comunica a la empresa", rol: "M" },
    ],
    correcta: "D",
  },

  // 9 — Intimación de proveedor → Director
  {
    texto: "La empresa recibió una intimación judicial de un proveedor importante. ¿Quién tiene la responsabilidad de responder?",
    aclaracion: "En una SA, los directores tienen responsabilidad personal ante conflictos legales.",
    opciones: [
      { label: "El directorio aprueba la estrategia legal y autoriza acuerdos", rol: "D" },
      { label: "El gerente de legales o abogado externo maneja todo solo", rol: "G" },
      { label: "El dueño habla con el proveedor y arregla directamente", rol: "A" },
      { label: "El gerente de compras que tiene la relación con el proveedor", rol: "G" },
      { label: "Se delega al estudio jurídico y nadie más se involucra", rol: "M" },
    ],
    correcta: "D",
  },

  // 10 — Distribución de dividendos → Accionista
  {
    texto: "Cerró bien el año. Los socios quieren saber cuánto se van a llevar. ¿Quién decide la distribución?",
    aclaracion: "La distribución de utilidades es un derecho de los accionistas, no una decisión gerencial.",
    opciones: [
      { label: "Los accionistas en asamblea, con recomendación del directorio", rol: "A" },
      { label: "El directorio define cuánto se reparte", rol: "D" },
      { label: "El CFO calcula lo distribuible y el CEO aprueba", rol: "G" },
      { label: "El socio mayoritario decide y comunica a los demás", rol: "M" },
      { label: "Se reinvierte todo sin consultar a los socios minoritarios", rol: "M" },
    ],
    correcta: "A",
  },
];

// ─── Calculator ───────────────────────────────────────────────────────────────

export function calcularModulo2(respuestas: number[]): Modulo2Resultado {
  const elegidos = respuestas.map((opIdx, sitIdx) => {
    const sit = SITUACIONES_M2[sitIdx];
    if (!sit || opIdx < 0 || opIdx >= sit.opciones.length) return "M";
    return sit.opciones[opIdx].rol;
  });

  const conteos = { A: 0, D: 0, G: 0, M: 0 };
  elegidos.forEach(v => {
    if (v === "A") conteos.A++;
    else if (v === "D") conteos.D++;
    else if (v === "G") conteos.G++;
    else conteos.M++;
  });

  let perfil: string;
  const mPct = conteos.M / 10;
  if (mPct >= 0.4) {
    perfil = "Rol híbrido no diferenciado";
  } else if (conteos.A >= conteos.D && conteos.A >= conteos.G) {
    perfil = "Perfil accionista dominante";
  } else if (conteos.D >= conteos.A && conteos.D >= conteos.G) {
    perfil = "Perfil director predominante";
  } else {
    perfil = "Perfil gerente ejecutor";
  }

  const tensiones: { pregunta: number; elegido: string; correcto: string }[] = [];
  elegidos.forEach((elegido, idx) => {
    if (elegido !== SITUACIONES_M2[idx].correcta && elegido !== "M" && tensiones.length < 3) {
      tensiones.push({
        pregunta: idx + 1,
        elegido,
        correcto: SITUACIONES_M2[idx].correcta,
      });
    }
  });

  const correctCount = elegidos.filter((v, i) => v === SITUACIONES_M2[i].correcta).length;
  const porcentaje = Math.round((correctCount / 10) * 100);

  return {
    score: correctCount,
    nivel: perfil,
    porcentaje,
    conteos,
    perfil,
    tensiones,
  };
}
