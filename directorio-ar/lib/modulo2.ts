import type { Modulo2Resultado } from "../types";

export type SituacionM2 = {
  texto: string;
  aclaracion: string;
  opciones: { label: string; tipo: 'concentrada' | 'parcial' | 'delegada' | 'gris' }[];
  beneficioDirectorio: string;
};

export const SITUACIONES_M2: SituacionM2[] = [
  {
    texto: "El banco ofrece una línea de crédito importante. ¿Quién decide si se toma?",
    aclaracion: "Endeudarse afecta el patrimonio de todos los socios.",
    opciones: [
      { label: "El dueño solo, sin consultar", tipo: "concentrada" },
      { label: "El dueño con el CFO o contador", tipo: "parcial" },
      { label: "Se analiza formalmente con datos antes de decidir", tipo: "delegada" },
      { label: "No hay un proceso claro, depende del momento", tipo: "gris" },
    ],
    beneficioDirectorio: "Esta es una decisión donde el directorio debe liderar (modo 'take charge'): evalúa el endeudamiento con análisis independiente, hace las preguntas correctas antes de opinar y protege el patrimonio de todos los socios — no solo del que firma.",
  },
  {
    texto: "El gerente comercial quiere contratar dos vendedores nuevos. ¿Cómo se resuelve?",
    aclaracion: "Es una decisión operativa dentro de un presupuesto ya aprobado.",
    opciones: [
      { label: "El dueño aprueba cada contratación personalmente", tipo: "concentrada" },
      { label: "El gerente propone y el dueño da el OK", tipo: "parcial" },
      { label: "El gerente decide dentro de su presupuesto aprobado", tipo: "delegada" },
      { label: "No hay regla clara, a veces sí a veces no", tipo: "gris" },
    ],
    beneficioDirectorio: "Esta es una decisión donde el directorio debe mantenerse al margen (modo 'stay out'): aprueba el presupuesto y deja que la gerencia ejecute con autonomía. Intervenir en contrataciones operativas es micro-gestión encubierta.",
  },
  {
    texto: "Dos socios no se ponen de acuerdo sobre expandir a otra provincia. ¿Qué pasa?",
    aclaracion: "Es una decisión estratégica con impacto en la operación y el capital.",
    opciones: [
      { label: "El socio con más poder decide", tipo: "concentrada" },
      { label: "Negocian entre ellos hasta que uno cede", tipo: "parcial" },
      { label: "Se analizan los números y se decide con criterio objetivo", tipo: "delegada" },
      { label: "Se posterga indefinidamente sin resolución", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio actúa como socio estratégico (modo 'partner'): facilita el debate con datos, practica la indagación antes que la recomendación, y funciona como árbitro institucional entre socios — sin que gane el que tiene más poder.",
  },
  {
    texto: "Un cliente clave tiene una queja grave. El equipo no sabe qué hacer. ¿Quién resuelve?",
    aclaracion: "Es una situación operativa que requiere respuesta inmediata.",
    opciones: [
      { label: "El dueño, porque es el único que puede hablar con ese cliente", tipo: "concentrada" },
      { label: "El gerente comercial consulta al dueño y después actúa", tipo: "parcial" },
      { label: "El gerente comercial tiene autonomía para resolver esto", tipo: "delegada" },
      { label: "No hay protocolo, se resuelve como se puede", tipo: "gris" },
    ],
    beneficioDirectorio: "Un directorio efectivo detecta esta dependencia y trabaja para eliminarla. Esta situación es operativa pura — el directorio debe mantenerse al margen y asegurar que la gerencia tenga la autonomía y los protocolos para resolver sin escalar al dueño.",
  },
  {
    texto: "Hay que definir cuánto cobra el CEO o dueño-gerente este año. ¿Cómo se decide?",
    aclaracion: "Si el CEO fija su propio sueldo, hay un conflicto de interés evidente.",
    opciones: [
      { label: "El dueño fija su propio sueldo", tipo: "concentrada" },
      { label: "Se conversa informalmente con los socios", tipo: "parcial" },
      { label: "Hay un criterio formal basado en resultados y mercado", tipo: "delegada" },
      { label: "No se revisa nunca, siempre fue igual", tipo: "gris" },
    ],
    beneficioDirectorio: "La compensación del CEO es una decisión donde el directorio debe liderar ('take charge'). Es una de las funciones más importantes del directorio como equipo: elimina el conflicto de interés y alinea incentivos con resultados reales.",
  },
  {
    texto: "Apareció la oportunidad de comprar un competidor. ¿Cómo se maneja?",
    aclaracion: "Una adquisición compromete capital, estrategia y riesgo al mismo tiempo.",
    opciones: [
      { label: "El dueño decide solo si le parece buena idea", tipo: "concentrada" },
      { label: "Se comenta entre socios pero no hay análisis formal", tipo: "parcial" },
      { label: "Se hace un análisis financiero y estratégico antes de decidir", tipo: "delegada" },
      { label: "Probablemente se deje pasar por falta de proceso", tipo: "gris" },
    ],
    beneficioDirectorio: "Las decisiones de M&A son el caso paradigmático del modo 'take charge': alto impacto, irreversibles, requieren análisis independiente. El directorio lidera, hace las preguntas difíciles que nadie quiere hacer, y decide como equipo — no como grupo de individuos.",
  },
  {
    texto: "Los resultados del trimestre fueron malos. ¿Qué pasa?",
    aclaracion: "La cadena de rendición de cuentas define la salud del gobierno corporativo.",
    opciones: [
      { label: "El dueño lo absorbe solo y ajusta sobre la marcha", tipo: "concentrada" },
      { label: "Se comenta con el equipo pero no hay rendición de cuentas formal", tipo: "parcial" },
      { label: "La gerencia presenta un informe y explica las causas", tipo: "delegada" },
      { label: "Nadie rinde cuentas formalmente", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio instala disciplina de rendición de cuentas como socio estratégico: la gerencia presenta, el directorio indaga antes de juzgar, pregunta 'por qué' antes de decir 'qué hacer', y los socios se informan con transparencia.",
  },
  {
    texto: "Un hijo del dueño quiere entrar a trabajar en la empresa. ¿Cómo se decide?",
    aclaracion: "Mezclar familia y empresa sin reglas claras genera conflictos que pueden destruir ambas.",
    opciones: [
      { label: "El dueño lo incorpora directamente", tipo: "concentrada" },
      { label: "Se habla en familia y se comunica a la empresa", tipo: "parcial" },
      { label: "Hay una política de ingreso de familiares con criterios claros", tipo: "delegada" },
      { label: "Genera incomodidad y nadie quiere tomar la decisión", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio lidera esta conversación difícil ('take charge'): establece reglas de juego objetivas para familiares. La diversidad de perspectivas del directorio como equipo genera políticas que protegen tanto a la empresa como a la familia.",
  },
  {
    texto: "La empresa recibe una demanda judicial de un proveedor. ¿Quién se hace cargo?",
    aclaracion: "En una SA, los directores tienen responsabilidad personal ante conflictos legales.",
    opciones: [
      { label: "El dueño habla con el proveedor y trata de arreglar", tipo: "concentrada" },
      { label: "Se delega al abogado externo sin seguimiento formal", tipo: "parcial" },
      { label: "Se define una estrategia legal con responsable y plazos", tipo: "delegada" },
      { label: "Nadie asume la responsabilidad claramente", tipo: "gris" },
    ],
    beneficioDirectorio: "Los directores tienen responsabilidad legal personal — esto los motiva a actuar con rigor. El directorio acompaña esta decisión en modo 'partner': no reemplaza al abogado, pero aprueba la estrategia legal con visión de negocio y protege a la empresa institucionalmente.",
  },
  {
    texto: "Cerró bien el año. ¿Cómo se decide cuánto se reparte entre socios?",
    aclaracion: "La distribución de utilidades es un derecho de los accionistas.",
    opciones: [
      { label: "El dueño mayoritario decide cuánto y cuándo", tipo: "concentrada" },
      { label: "Se conversa entre socios informalmente", tipo: "parcial" },
      { label: "Hay una política de dividendos aprobada y se respeta", tipo: "delegada" },
      { label: "Genera conflicto cada vez, no hay reglas claras", tipo: "gris" },
    ],
    beneficioDirectorio: "El directorio lidera la recomendación de dividendos ('take charge') equilibrando reinversión y retorno. Como equipo diverso, aporta perspectivas que ningún socio individual tiene. Los socios aprueban en asamblea con información completa y reglas claras.",
  },
];

// ─── Scoring ────────────────────────────────────────────────────────────────

const TIPO_SCORE: Record<string, number> = {
  concentrada: 3,
  gris: 2,
  parcial: 1,
  delegada: 0,
};

export function calcularModulo2(respuestas: number[]): Modulo2Resultado {
  const conteos = { concentrada: 0, parcial: 0, delegada: 0, gris: 0 };
  const tensiones: { pregunta: number; tipo: string; beneficio: string }[] = [];

  respuestas.forEach((opIdx, sitIdx) => {
    const sit = SITUACIONES_M2[sitIdx];
    if (!sit || opIdx < 0 || opIdx >= sit.opciones.length) {
      conteos.gris++;
      return;
    }
    const tipo = sit.opciones[opIdx].tipo;
    conteos[tipo]++;

    if (tipo === 'concentrada' || tipo === 'gris') {
      tensiones.push({
        pregunta: sitIdx + 1,
        tipo,
        beneficio: sit.beneficioDirectorio,
      });
    }
  });

  const totalScore = respuestas.reduce((sum, opIdx, sitIdx) => {
    const sit = SITUACIONES_M2[sitIdx];
    if (!sit || opIdx < 0 || opIdx >= sit.opciones.length) return sum + 2;
    return sum + (TIPO_SCORE[sit.opciones[opIdx].tipo] ?? 0);
  }, 0);

  const maxScore = 10 * 3;
  const concentracionPct = Math.round(((conteos.concentrada + conteos.gris) / 10) * 100);

  let perfil: string;
  if (concentracionPct >= 70) perfil = "Concentración crítica";
  else if (concentracionPct >= 50) perfil = "Concentración alta";
  else if (concentracionPct >= 30) perfil = "Concentración moderada";
  else perfil = "Buena delegación";

  let nivel: string;
  if (concentracionPct >= 70) nivel = "Las decisiones están peligrosamente concentradas. El directorio es urgente.";
  else if (concentracionPct >= 50) nivel = "Hay una concentración significativa. Un directorio aportaría mucho valor.";
  else if (concentracionPct >= 30) nivel = "Algunas decisiones necesitan mejor gobierno. Un directorio ayudaría.";
  else nivel = "Buen nivel de delegación. Un directorio consolidaría las buenas prácticas.";

  return {
    score: totalScore,
    nivel,
    porcentaje: concentracionPct,
    conteos,
    perfil,
    tensiones,
  };
}
