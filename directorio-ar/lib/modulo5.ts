// Módulo 5 — Consejo y gerencia: cómo van a trabajar juntos.
// 5 preguntas prácticas sobre la relación que se QUIERE construir (no supone que el consejo ya exista).
// Cada respuesta vale 1 (regla clara), 0.5 (a ajustar) o 0 (a trabajar) y alimenta un "acuerdo de trabajo".
import type { Modulo5Resultado } from "../types";
import type { GrupoRol } from "./pymes";

export type ValorM5 = 1 | 0.5 | 0;

type Texto = string | Record<GrupoRol, string>;

export type TemaM5 = {
  id: string;
  tema: string;
  pregunta: Texto;
  aclaracion: string;
  opciones: { texto: Texto; valor: ValorM5 }[];
  /** La regla recomendada que va al acuerdo de trabajo. */
  regla: string;
  /** Consejo práctico si la respuesta no fue la ideal. */
  consejo: string;
};

export const TEMAS_M5: TemaM5[] = [
  {
    id: "informacion",
    tema: "Información",
    pregunta: "¿Cómo va a recibir el consejo la información antes de cada reunión?",
    aclaracion: "Sin información previa, la reunión se va en ponerse al día y no queda tiempo para pensar.",
    opciones: [
      { texto: "Un informe breve con números y temas, una semana antes", valor: 1 },
      { texto: "Lo que haya disponible, unos días antes", valor: 0.5 },
      { texto: "Se presenta en la misma reunión", valor: 0 },
    ],
    regla: "La gerencia envía un informe breve (números del período + temas a decidir) una semana antes de cada reunión.",
    consejo: "Empezá con una sola hoja: ventas, margen, caja, deuda y los 2 temas a decidir. Con eso alcanza para arrancar.",
  },
  {
    id: "decisiones",
    tema: "Qué se decide en la mesa",
    pregunta: "¿Qué decisiones van a pasar por el consejo?",
    aclaracion: "Si no está claro qué se lleva a la mesa, todo termina decidiéndose afuera.",
    opciones: [
      { texto: "Una lista acordada: endeudamiento, inversiones grandes, socios, sueldo del CEO", valor: 1 },
      { texto: "Las que el dueño quiera consultar en cada momento", valor: 0.5 },
      { texto: "Ninguna en particular: el consejo es solo para opinar", valor: 0 },
    ],
    regla: "Hay una lista escrita de decisiones que siempre pasan por el consejo (endeudamiento, inversiones grandes, ingreso de socios, sueldo del CEO).",
    consejo: "Armá la lista en la primera reunión: 5 a 8 decisiones. Todo lo demás queda en manos de la gerencia.",
  },
  {
    id: "contacto",
    tema: "Contacto con el equipo",
    pregunta: "Si un asesor necesita información de un gerente, ¿cómo lo hace?",
    aclaracion: "Cuando los asesores dan órdenes al equipo, la gerencia pierde autoridad y se generan dos jefes.",
    opciones: [
      { texto: "La pide a través del CEO o de quien preside el consejo", valor: 1 },
      { texto: "Habla directo con el gerente, avisando al CEO", valor: 0.5 },
      { texto: "Habla directo con quien quiera, cuando quiera", valor: 0 },
    ],
    regla: "Los asesores piden información a través del CEO o de quien preside el consejo, nunca dan instrucciones al equipo.",
    consejo: "Dejalo por escrito desde el inicio: evita el problema más común entre consejo y gerencia.",
  },
  {
    id: "desacuerdo",
    tema: "Desacuerdos",
    pregunta: {
      propietario: "Si el consejo no está de acuerdo con una decisión importante tuya, ¿qué pasa?",
      gestor: "Si el consejo no está de acuerdo con una decisión importante tuya o de los dueños, ¿qué pasa?",
      familiar: "Si el consejo no está de acuerdo con una decisión importante de quien gestiona, ¿qué pasa?",
    },
    aclaracion: "El valor del consejo está en las preguntas incómodas. Si nunca hay desacuerdo, sobra.",
    opciones: [
      { texto: "Se debate, se pide más información y se decide en la próxima reunión", valor: 1 },
      { texto: { propietario: "Escucho la opinión, pero decido igual", gestor: "Se escucha la opinión, pero se decide igual", familiar: "Se escucha la opinión, pero se decide igual" }, valor: 0.5 },
      { texto: { propietario: "Prefiero que el consejo no cuestione mis decisiones", gestor: "Preferimos que el consejo no cuestione las decisiones", familiar: "Se prefiere que el consejo no cuestione las decisiones" }, valor: 0 },
    ],
    regla: "Ante un desacuerdo importante, se pide más información y la decisión se toma en la reunión siguiente, con todos los datos.",
    consejo: "Probá con una regla simple: ninguna decisión grande se toma en la misma reunión en que se presenta.",
  },
  {
    id: "evaluacion",
    tema: "Evaluación",
    pregunta: "¿Cómo se va a medir si el consejo y la gerencia funcionan bien?",
    aclaracion: "Lo que no se revisa no mejora: una vez por año alcanza.",
    opciones: [
      { texto: "Una evaluación anual del CEO y del propio consejo", valor: 1 },
      { texto: "Una charla informal a fin de año", valor: 0.5 },
      { texto: "No hace falta evaluarlo", valor: 0 },
    ],
    regla: "Una vez por año se evalúa el desempeño del CEO y el funcionamiento del propio consejo.",
    consejo: "La herramienta de Evaluación del CEO (Fase 3) te deja hacerlo en 15 minutos por persona.",
  },
];

export const TOTAL_M5 = TEMAS_M5.length;

export function textoM5(t: Texto, grupo: GrupoRol): string {
  return typeof t === "string" ? t : t[grupo];
}

export const ESTADO_REGLA: Record<ValorM5, { label: string; color: string; bg: string }> = {
  1: { label: "Ya lo tenés claro", color: "#0F6E56", bg: "#E1F5EE" },
  0.5: { label: "A ajustar", color: "#854F0B", bg: "#FAEEDA" },
  0: { label: "Clave a acordar", color: "#B42318", bg: "#FCEBEB" },
};

export function calcularModulo5(respuestas: ValorM5[]): Modulo5Resultado {
  const sum = respuestas.reduce<number>((s, v) => s + v, 0);
  const porcentaje = respuestas.length > 0 ? Math.round((sum / respuestas.length) * 100) : 0;
  let nivel: string;
  if (porcentaje >= 75) nivel = "Reglas claras desde el inicio";
  else if (porcentaje >= 50) nivel = "Buena base, con ajustes";
  else if (porcentaje >= 25) nivel = "Hay puntos clave a acordar";
  else nivel = "Conviene acordar las reglas antes de arrancar";
  return { score: sum, nivel, porcentaje, respuestas };
}
