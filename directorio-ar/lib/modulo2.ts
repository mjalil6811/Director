import type { Modulo2Resultado } from "../types";
import { SITUACIONES_M2 } from "./preguntas";

export { SITUACIONES_M2, type SituacionM2, type DecisionM2 } from "./preguntas";


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

  const total = SITUACIONES_M2.length;
  const concentracionPct = Math.round(((conteos.concentrada + conteos.gris) / total) * 100);

  let perfil: string;
  if (concentracionPct >= 70) perfil = "Concentración crítica";
  else if (concentracionPct >= 50) perfil = "Concentración alta";
  else if (concentracionPct >= 30) perfil = "Concentración moderada";
  else perfil = "Buena delegación";

  let nivel: string;
  if (concentracionPct >= 70) nivel = "Las decisiones están peligrosamente concentradas. El directorio es urgente.";
  else if (concentracionPct >= 50) nivel = "Hay una concentración significativa. Un directorio aportaría mucho valor.";
  else if (concentracionPct >= 30) nivel = "Algunas decisiones necesitan más orden. Un directorio ayudaría.";
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
