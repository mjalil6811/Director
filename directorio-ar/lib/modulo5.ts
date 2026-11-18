// Módulo 5 — Consejo y gerencia: cómo van a trabajar juntos.
// 5 preguntas prácticas sobre la relación que se QUIERE construir (no supone que el consejo ya exista).
// Cada respuesta vale 1 (regla clara), 0.5 (a ajustar) o 0 (a trabajar) y alimenta un "acuerdo de trabajo".
import type { Modulo5Resultado } from "../types";
import { TEMAS_M5, SITUACIONES_M2, texto, type ValorM5, type DecisionM2 } from "./preguntas";
import type { GrupoRol } from "./pymes";

export { TEMAS_M5, type TemaM5, type ValorM5 } from "./preguntas";

export const TOTAL_M5 = TEMAS_M5.length;

export function textoM5(t: string | Record<GrupoRol, string>, grupo: GrupoRol): string {
  return texto(t, grupo);
}

// ——— Decisiones que pasan por el consejo: se precargan con lo respondido en el Módulo 2 ————————

/** Si no hay Módulo 2 respondido, se sugieren estas. */
const SUGERIDAS_SIN_M2: DecisionM2[] = ["credito", "sueldo_ceo", "dividendos"];

export type Precarga = { ids: DecisionM2[]; origen: "m2" | "sugerencia" };

/** Decisiones que en el M2 quedaron concentradas o sin proceso claro: son las candidatas a pasar por el consejo. */
export function precargarDecisiones(respuestasM2: number[] | null): Precarga {
  const completo = respuestasM2 && respuestasM2.length === SITUACIONES_M2.length && respuestasM2.every(v => v >= 0);
  if (!completo) return { ids: SUGERIDAS_SIN_M2, origen: "sugerencia" };
  const ids = SITUACIONES_M2
    .filter((s, i) => {
      const tipo = s.opciones[respuestasM2[i]]?.tipo;
      return tipo === "concentrada" || tipo === "gris";
    })
    .map(s => s.id);
  return { ids, origen: "m2" };
}

/** Regla del acuerdo de trabajo con la lista concreta de decisiones elegidas. */
export function reglaDecisiones(ids: string[]): string | null {
  const nombres = SITUACIONES_M2.filter(s => ids.includes(s.id)).map(s => s.decision.toLowerCase());
  if (nombres.length === 0) return null;
  const lista = nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
  return `Estas decisiones pasan siempre por el consejo: ${lista}. Todo lo demás queda en manos de la gerencia.`;
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
