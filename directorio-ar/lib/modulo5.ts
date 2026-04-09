import type { Modulo5Resultado } from "../types";

export const AFIRMACIONES_M5 = [
  "El CEO informa al directorio antes de tomar decisiones importantes, no después.",
  "El directorio recibe información financiera completa antes de cada reunión.",
  "El presidente del directorio y el CEO son personas distintas.",
  "El directorio ha cuestionado en profundidad al menos una propuesta en el último año.",
  "Los directores no contactan directamente a gerentes de segunda línea.",
  "La agenda de reuniones la define el presidente del directorio, no el CEO.",
  "Existe un proceso formal de evaluación anual del CEO.",
  "El CEO ve al directorio como un recurso estratégico, no como una carga.",
  "Hay un acuerdo claro sobre qué decide la gerencia sola y qué requiere aprobación.",
  "El directorio realiza una autoevaluación anual de su propio funcionamiento.",
];

export const OPCIONES_M5 = [
  { label: "Sí", value: 1 as const },
  { label: "Parcial", value: 0.5 as const },
  { label: "No", value: 0 as const },
];

export function calcularModulo5(respuestas: (1 | 0.5 | 0)[]): Modulo5Resultado {
  const answered = respuestas.filter(v => v !== null && v !== undefined);
  const sum = answered.reduce((s: number, v) => s + v, 0);
  const porcentaje = answered.length > 0 ? Math.round((sum / answered.length) * 100) : 0;

  let nivel: string;
  if (porcentaje >= 75) nivel = "Relación sana y funcional";
  else if (porcentaje >= 50) nivel = "Relación en construcción";
  else if (porcentaje >= 25) nivel = "Relación con tensiones serias";
  else nivel = "Relación crítica o inexistente";

  return {
    score: sum,
    nivel,
    porcentaje,
    respuestas,
  };
}
